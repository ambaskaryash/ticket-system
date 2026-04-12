import clsx from 'clsx';

/**
 * SLAProgressBar — Visual SLA progress indicator.
 * Shows a colored bar + text label based on SLA status from getSLAStatus().
 */
export default function SLAProgressBar({ sla, compact = false }) {
  if (!sla || sla.status === 'resolved' || sla.status === 'unknown') return null;

  const barColor =
    sla.status === 'breach'
      ? 'bg-red-600'
      : sla.status === 'warning'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const textColor =
    sla.status === 'breach'
      ? 'text-red-700'
      : sla.status === 'warning'
        ? 'text-amber-700'
        : 'text-emerald-700';

  const trackColor =
    sla.status === 'breach'
      ? 'bg-red-100'
      : sla.status === 'warning'
        ? 'bg-amber-100'
        : 'bg-emerald-100';

  const percent = Math.min(100, Math.max(0, sla.percent || 0));

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className={clsx('h-1.5 flex-1 rounded-full overflow-hidden', trackColor)}>
          <div
            className={clsx('h-full rounded-full transition-all duration-500', barColor, sla.status === 'breach' && 'animate-pulse-soft')}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={clsx('text-xs font-medium whitespace-nowrap', textColor)}>
          {sla.status === 'breach' ? 'Overdue' : sla.label}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-neutral-500">SLA</span>
        <span className={clsx('text-xs font-semibold', textColor)}>
          {sla.status === 'breach' ? `🔴 ${sla.label}` : sla.label}
        </span>
      </div>
      <div className={clsx('h-2 w-full rounded-full overflow-hidden', trackColor)}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            barColor,
            sla.status === 'breach' && 'animate-pulse-soft'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-neutral-400">Created</span>
        <span className="text-[10px] text-neutral-400">SLA Deadline</span>
      </div>
    </div>
  );
}
