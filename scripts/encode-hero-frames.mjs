#!/usr/bin/env node
/**
 * Encode the Blender frame sequence for the scroll-driven hero.
 *
 * Reads PNGs from an input folder, writes WebP at two sizes to
 * public/hero-frames/{desktop,mobile}/frame-NNN.webp.
 *
 * Usage:
 *   node scripts/encode-hero-frames.mjs --input <folder>
 *   node scripts/encode-hero-frames.mjs --input ~/Downloads/hero-frames
 *
 * Defaults:
 *   --input    C:/Users/Niki/Downloads/hero-frames
 *   --output   public/hero-frames
 *   --sizes    desktop:1080@q80, mobile:540@q75
 *
 * Idempotent — re-running overwrites existing output. Safe to commit
 * the WebP output to git (~15MB total at default settings).
 */

import { mkdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'
import sharp from 'sharp'

const args = parseArgs(process.argv.slice(2))
const INPUT = path.resolve(args.input ?? 'C:/Users/Niki/Downloads/hero-frames')
const OUTPUT = path.resolve(args.output ?? 'public/hero-frames')
const SIZES = [
  { name: 'desktop', dimension: 1080, quality: 80 },
  { name: 'mobile', dimension: 540, quality: 75 },
]
const CONCURRENCY = 8

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const val = argv[i + 1]
      if (val && !val.startsWith('--')) {
        out[key] = val
        i++
      } else {
        out[key] = true
      }
    }
  }
  return out
}

async function main() {
  if (!existsSync(INPUT)) {
    console.error(`✗ Input folder not found: ${INPUT}`)
    console.error('  Pass --input <folder> with the source PNGs.')
    process.exit(1)
  }

  // Glob + natural sort so frame_0001, frame_0002, ... stay in order
  const inputFiles = (await glob('**/*.{png,PNG}', { cwd: INPUT, absolute: true }))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  if (inputFiles.length === 0) {
    console.error(`✗ No PNG files found in: ${INPUT}`)
    process.exit(1)
  }

  console.log(`Found ${inputFiles.length} PNG frames in ${INPUT}`)
  console.log(`Output: ${OUTPUT}`)
  console.log('')

  // Fresh start per run — wipe output to avoid stale frames
  if (existsSync(OUTPUT)) await rm(OUTPUT, { recursive: true })

  for (const size of SIZES) {
    const outDir = path.join(OUTPUT, size.name)
    await mkdir(outDir, { recursive: true })
    console.log(`Encoding ${size.name} (${size.dimension}×${size.dimension}, q${size.quality})…`)

    const totalBytes = await encodeBatch(inputFiles, outDir, size)
    const mb = (totalBytes / 1024 / 1024).toFixed(2)
    console.log(`  ✓ ${inputFiles.length} frames, ${mb} MB total\n`)
  }

  console.log('Done.')
}

async function encodeBatch(inputs, outDir, size) {
  let bytes = 0
  let completed = 0
  const pending = new Set()

  async function runOne(input, index) {
    const name = `frame-${String(index + 1).padStart(3, '0')}.webp`
    const dest = path.join(outDir, name)
    await sharp(input)
      .resize(size.dimension, size.dimension, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: size.quality, effort: 4 })
      .toFile(dest)
    const s = await stat(dest)
    bytes += s.size
    completed++
    if (completed % 24 === 0 || completed === inputs.length) {
      process.stdout.write(`  ${completed}/${inputs.length}\r`)
    }
  }

  for (let i = 0; i < inputs.length; i++) {
    const task = runOne(inputs[i], i)
    pending.add(task)
    task.finally(() => pending.delete(task))
    if (pending.size >= CONCURRENCY) await Promise.race(pending)
  }
  await Promise.all(pending)
  process.stdout.write('\n')
  return bytes
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
