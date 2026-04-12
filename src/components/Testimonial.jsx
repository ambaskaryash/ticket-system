import { FadeIn } from './FadeIn';
import { GridPattern } from './GridPattern';

/**
 * Testimonial — Studio-style CSAT blockquote with GridPattern background.
 * Shows a sample customer quote to build trust on public-facing pages.
 */
export default function Testimonial({ quote, author, rating, className = '' }) {
  return (
    <div className={`relative isolate bg-neutral-50 rounded-4xl py-16 sm:py-20 overflow-hidden ${className}`}>
      <GridPattern
        className="absolute inset-0 -z-10 h-full w-full fill-neutral-100 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_50%,transparent_60%)]"
        yOffset={-256}
      />
      <div className="mx-auto max-w-2xl px-6">
        <FadeIn>
          <figure>
            {/* Star rating */}
            {rating && (
              <div className="flex items-center justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`size-5 ${s <= rating ? 'text-amber-400' : 'text-neutral-200'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            )}

            {/* Quote */}
            <blockquote className="text-center font-display text-2xl font-medium tracking-tight text-neutral-950 sm:text-3xl">
              <p>{"\u201C"}{quote}{"\u201D"}</p>
            </blockquote>

            {/* Attribution */}
            {author && (
              <figcaption className="mt-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-neutral-950 text-white text-sm font-semibold">
                    {author.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-950">{author}</p>
                    <p className="text-xs text-neutral-600">Verified Student</p>
                  </div>
                </div>
              </figcaption>
            )}
          </figure>
        </FadeIn>
      </div>
    </div>
  );
}
