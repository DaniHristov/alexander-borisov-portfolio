'use client'

/**
 * Scroll-driven hero — fixed-position canvas that scrubs through a frame
 * sequence rendered in Blender.
 *
 * Frames live at /hero-frames/{desktop|mobile}/frame-001.webp through
 * frame-NNN.webp (encoded by scripts/encode-hero-frames.mjs from PNGs in a
 * source folder — not committed).
 *
 * Layout pattern (NOT GSAP pin):
 * - The <section> is given an explicit height of SCROLL_DISTANCE px so it
 *   occupies exactly the scroll length the animation needs — no more.
 * - The visible stage is `position: fixed` and overlays the viewport; it
 *   hides itself once the user scrolls past the section. This avoids the
 *   trailing ~100vh that GSAP's pinSpacing would otherwise add below the
 *   pin (which looked like a phantom empty section before the footer).
 *
 * ScrollTrigger is used only to map scroll progress → frame index / fade
 * timelines; it does not pin anything.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'

const FRAME_COUNT = 289
const SCROLL_DISTANCE = 1800 // section height = scroll length for the scrub
// Sequence: animation plays → canvas fades to black → stage hands off to the
// collage in flow below (no tagline menu finale anymore).
const ANIMATION_END_PROGRESS = 0.90 // frames reach last frame at 90% scroll
const CANVAS_FADE_START = 0.90 // canvas begins fading to black
const CANVAS_FADE_END = 1.0 // canvas fully invisible right at the handoff
const TAGLINE_FADE_START = 0.95 // (sr-only content — kept for the h1)
const TAGLINE_FADE_END = 1.0
const NAV_REVEAL_PROGRESS = 0.92 // nav fades in around the handover
const MOBILE_BREAKPOINT = 800
const LOAD_CONCURRENCY = 8

type FrameSet = 'desktop' | 'mobile'

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

function frameUrl(set: FrameSet, index: number): string {
  return `/hero-frames/${set}/frame-${pad(index + 1, 3)}.webp`
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.decoding = 'async'
    img.src = src
  })
}

async function loadWithConcurrency(
  urls: string[],
  concurrency: number,
  onProgress: (loaded: number) => void,
): Promise<HTMLImageElement[]> {
  const results: HTMLImageElement[] = new Array(urls.length)
  let loaded = 0
  let nextIndex = 0

  async function worker() {
    while (true) {
      const i = nextIndex++
      if (i >= urls.length) return
      try {
        results[i] = await loadImage(urls[i])
      } catch (err) {
        console.warn(`[HeroScrollFrames] ${(err as Error).message}`)
      }
      loaded++
      onProgress(loaded)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()),
  )
  return results
}

export function HeroScrollFrames({ tagline }: { tagline: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const [loadedCount, setLoadedCount] = useState(0)
  const [allLoaded, setAllLoaded] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [skipVisible, setSkipVisible] = useState(true)
  const [pastHero, setPastHero] = useState(false)

  // Decide frame set (only on client; default to desktop for SSR)
  const [frameSet, setFrameSet] = useState<FrameSet>('desktop')

  useEffect(() => {
    setFrameSet(window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop')
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onMqChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onMqChange)
    return () => mq.removeEventListener('change', onMqChange)
  }, [])

  // Preload frames
  useEffect(() => {
    let cancelled = false
    const urls = Array.from({ length: FRAME_COUNT }, (_, i) => frameUrl(frameSet, i))
    setLoadedCount(0)
    setAllLoaded(false)

    loadWithConcurrency(urls, LOAD_CONCURRENCY, (n) => {
      if (!cancelled) setLoadedCount(n)
    })
      .then((imgs) => {
        if (cancelled) return
        framesRef.current = imgs
        setAllLoaded(true)
        // Paint first frame immediately
        drawFrame(reducedMotion ? FRAME_COUNT - 1 : 0)
      })
      .catch((err) => console.warn('[HeroScrollFrames] preload error', err))

    return () => {
      cancelled = true
    }
    // drawFrame closes over canvasRef/framesRef which are stable
  }, [frameSet, reducedMotion])

  function drawFrame(index: number) {
    const canvas = canvasRef.current
    const img = framesRef.current[index]
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Match canvas backing-store to display size × DPR for sharpness
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const w = Math.round(rect.width * dpr)
    const h = Math.round(rect.height * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    ctx.clearRect(0, 0, w, h)

    // Letterbox the square frame into the canvas area
    const scale = Math.min(w / img.width, h / img.height)
    const drawW = img.width * scale
    const drawH = img.height * scale
    const dx = (w - drawW) / 2
    const dy = (h - drawH) / 2
    ctx.drawImage(img, dx, dy, drawW, drawH)
  }

  // Set up the pin + scroll-driven scrub via GSAP ScrollTrigger.
  // GSAP is dynamically imported so the chunk only loads on this page.
  useEffect(() => {
    if (!allLoaded) return
    if (reducedMotion) return // static last frame; no pin

    let cleanup: (() => void) | undefined

    ;(async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const section = sectionRef.current
      const tagline = taglineRef.current
      if (!section) return

      // Bidirectional nav reveal — fades in past the threshold, hides again
      // if the user scrolls back into the hero animation.
      let revealed = false
      const fireReveal = (shouldReveal: boolean) => {
        if (shouldReveal === revealed) return
        revealed = shouldReveal
        window.dispatchEvent(new Event(shouldReveal ? 'hero:reveal' : 'hero:hide'))
      }

      // Handoff signal for the in-flow menu below the hero. While the fixed
      // stage is in front (`hero:within`) the in-flow menu hides, so the two
      // identical menus never show at once during the scroll handoff; once the
      // user scrolls past the section (`hero:past`) the fixed stage fades out
      // and the in-flow menu takes over at viewport center. `null` start makes
      // the first call always dispatch, syncing listeners to current state.
      let past: boolean | null = null
      const firePast = (isPast: boolean) => {
        if (isPast === past) return
        past = isPast
        window.dispatchEvent(new Event(isPast ? 'hero:past' : 'hero:within'))
      }

      // Skip button visibility tracks the inverse of nav reveal: visible
      // during the animation, hidden once nav appears (and so the user can
      // see the content the skip would have taken them to).
      let lastSkipVisible = true
      const updateSkip = (shouldShow: boolean) => {
        if (shouldShow === lastSkipVisible) return
        lastSkipVisible = shouldShow
        setSkipVisible(shouldShow)
      }

      // Pure scrub — no pin. Trigger runs for SCROLL_DISTANCE px of scroll
      // starting at section top; onLeave fires exactly at scrollY = SCROLL_DISTANCE,
      // matching where the section ends in flow (so the in-flow menu section
      // immediately below picks up at viewport center).
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${SCROLL_DISTANCE}`,
        scrub: 0.5,
        onUpdate: (self) => {
          const frameProgress = Math.min(1, self.progress / ANIMATION_END_PROGRESS)
          const target = Math.min(
            FRAME_COUNT - 1,
            Math.round(frameProgress * (FRAME_COUNT - 1)),
          )
          if (target !== currentFrameRef.current) {
            currentFrameRef.current = target
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(() => drawFrame(target))
          }
          fireReveal(self.progress >= NAV_REVEAL_PROGRESS)
          updateSkip(self.progress < NAV_REVEAL_PROGRESS)
        },
        onEnter: () => {
          setPastHero(false)
          firePast(false)
        },
        onEnterBack: () => {
          setPastHero(false)
          firePast(false)
        },
        onLeave: () => {
          setPastHero(true)
          firePast(true)
        },
        onLeaveBack: () => {
          setPastHero(false)
          firePast(false)
        },
      })

      // Sync the in-flow menu to the current scroll position on load (e.g.
      // refresh partway down the page), since the on* callbacks above only
      // fire on subsequent boundary crossings.
      firePast(trigger.progress >= 1)

      // Canvas fades out after the animation finishes — black bg of the
      // stage shows through, then tagline appears on clean black.
      const canvasFade =
        canvasRef.current &&
        gsap.fromTo(
          canvasRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'power1.in',
            scrollTrigger: {
              trigger: section,
              start: `top top-=${SCROLL_DISTANCE * CANVAS_FADE_START}`,
              end: `top top-=${SCROLL_DISTANCE * CANVAS_FADE_END}`,
              scrub: 0.5,
            },
          },
        )

      // Tagline (now the section menu) fades in only after the canvas has
      // faded out — no overlap.
      const taglineTween =
        tagline &&
        gsap.fromTo(
          tagline,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: `top top-=${SCROLL_DISTANCE * TAGLINE_FADE_START}`,
              end: `top top-=${SCROLL_DISTANCE * TAGLINE_FADE_END}`,
              scrub: 0.5,
            },
          },
        )

      // Redraw on resize (canvas pixel size depends on layout)
      const onResize = () => drawFrame(currentFrameRef.current)
      window.addEventListener('resize', onResize)

      cleanup = () => {
        trigger.kill()
        canvasFade?.scrollTrigger?.kill()
        canvasFade?.kill()
        taglineTween?.scrollTrigger?.kill()
        taglineTween?.kill()
        window.removeEventListener('resize', onResize)
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
        // Ensure nav + in-flow menu are shown when the hero unmounts (e.g.
        // navigating away while the stage was still in front).
        window.dispatchEvent(new Event('hero:reveal'))
        window.dispatchEvent(new Event('hero:past'))
      }
    })()

    return () => {
      cleanup?.()
    }
  }, [allLoaded, reducedMotion])

  // For reduced-motion users, no scroll-driven reveal — show nav, and mark
  // the hero "past" so the in-flow menu (which defaults visible) stays shown.
  useEffect(() => {
    if (reducedMotion) {
      window.dispatchEvent(new Event('hero:reveal'))
      window.dispatchEvent(new Event('hero:past'))
    }
  }, [reducedMotion])

  const progress = Math.round((loadedCount / FRAME_COUNT) * 100)

  function handleSkip() {
    // Scroll just past the end of the pin so the user lands on the section
    // below the hero. Native smooth scroll handles the easing.
    window.scrollTo({
      top: SCROLL_DISTANCE + 80,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <section
      ref={sectionRef}
      // Section is exactly SCROLL_DISTANCE tall (or 100vh for reduced motion).
      // -mt cancels the top padding on <main> so the visible stage aligns
      // with the very top of the viewport (the fixed nav overlays the top).
      className="relative -mt-[84px] bg-black text-white md:-mt-[100px]"
      style={{
        height: reducedMotion ? '100vh' : `${SCROLL_DISTANCE}px`,
      }}
      aria-label="Designer reel"
    >
      {/* z-10 keeps the opaque stage above the in-flow content below the
          hero (the collage) until it fades out. For reduced motion the stage
          is absolute, not fixed, so it scrolls away with the section instead
          of covering the page forever (pastHero never fires without the
          scroll-driven trigger). */}
      <div
        ref={stageRef}
        className={`${reducedMotion ? 'absolute' : 'fixed'} inset-0 z-10 flex h-screen w-full items-center justify-center overflow-hidden bg-black transition-opacity duration-200 ${
          pastHero ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />

        {/* Tagline / menu overlay — starts hidden (inline style avoids flash
            before GSAP loads). Reduced-motion users see it immediately. */}
        <div
          ref={taglineRef}
          // Release pointer events once the hero is past — otherwise this
          // invisible overlay (fixed, painted above the in-flow menu) keeps
          // intercepting hover/clicks, since pointer-events-auto on a child
          // overrides the parent's pointer-events-none.
          className={`relative z-10 px-6 text-center ${
            pastHero ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          {tagline}
        </div>

        {/* Skip button — downward arrow, bottom-center, only during the animation */}
        {!reducedMotion && allLoaded && (
          <button
            type="button"
            onClick={handleSkip}
            className={`pointer-events-auto absolute bottom-8 left-1/2 z-20 inline-flex h-11 w-11 -translate-x-1/2 items-center justify-center border border-white/25 text-white/75 transition-opacity duration-500 hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              skipVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="Skip the intro animation"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M12 4v16" strokeLinecap="round" />
              <path d="M6 14l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Loading progress bar — only visible until preload completes */}
        {!allLoaded && (
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" aria-hidden>
            <div
              className="h-full bg-white/60 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
