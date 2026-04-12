import clsx from 'clsx';
import { Border } from './Border';
import { FadeIn, FadeInStagger } from './FadeIn';

/**
 * GridList — Studio-style list with Border left-accent items.
 * Used for Agent and Template cards.
 */
export function GridList({ children, className }) {
  return (
    <FadeInStagger>
      <ul
        role="list"
        className={clsx(
          'grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3',
          className,
        )}
      >
        {children}
      </ul>
    </FadeInStagger>
  );
}

export function GridListItem({
  title,
  subtitle,
  children,
  className,
  actions,
  accent,
}) {
  return (
    <li
      className={clsx(
        'text-base text-neutral-600 before:bg-neutral-950 after:bg-neutral-100',
        className,
      )}
    >
      <FadeIn>
        <Border position="left" className="pl-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {accent && (
                  <div className={clsx('size-2.5 rounded-full shrink-0', accent)} />
                )}
                <strong className="font-semibold text-neutral-950 truncate block">
                  {title}
                </strong>
              </div>
              {subtitle && (
                <p className="text-sm text-neutral-500 truncate">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {actions}
              </div>
            )}
          </div>
          {children && (
            <div className="mt-3 text-sm text-neutral-600 leading-relaxed">
              {children}
            </div>
          )}
        </Border>
      </FadeIn>
    </li>
  );
}
