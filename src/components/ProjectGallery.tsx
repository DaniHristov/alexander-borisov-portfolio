import Image from 'next/image';
import type { ProjectImage } from '@/content/types';

interface Props {
  images: ProjectImage[];
}

export function ProjectGallery({ images }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 px-6 md:gap-12 md:px-10">
      {images.map((img, i) => (
        <figure
          key={`${img.src}-${i}`}
          className="w-full"
          // Never upscale past the image's real size — a small cover/logo stays
          // its original dimensions instead of being stretched to fill. Larger
          // images just scale down to fit the column.
          style={{ maxWidth: img.width }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes={`(max-width: ${img.width}px) 100vw, ${img.width}px`}
            className={`h-auto w-full ${i === 0 ? 'first-image-fade' : ''}`}
            priority={i === 0}
          />
          {img.caption ? (
            <figcaption className="mt-2 text-xs text-muted">{img.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
