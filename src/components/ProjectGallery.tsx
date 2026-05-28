import Image from 'next/image';
import type { ProjectImage } from '@/content/types';

interface Props {
  images: ProjectImage[];
}

const FULL_BLEED_MIN_WIDTH = 1600;

export function ProjectGallery({ images }: Props) {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {images.map((img, i) => {
        const fullBleed = img.width >= FULL_BLEED_MIN_WIDTH;
        return (
          <figure
            key={`${img.src}-${i}`}
            className={fullBleed ? 'px-0' : 'mx-auto w-full max-w-[960px] px-6 md:px-10'}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes={fullBleed ? '100vw' : '(min-width: 1024px) 960px, 100vw'}
              className={`h-auto w-full ${i === 0 ? 'first-image-fade' : ''}`}
              priority={i === 0}
            />
            {img.caption ? (
              <figcaption className="mx-auto mt-2 max-w-[960px] text-xs text-muted">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
