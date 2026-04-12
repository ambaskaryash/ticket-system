import { getStatusConfig, getPriorityConfig } from './StatsCard';
import { getSLAStatus } from '../utils/sla';
import SLAProgressBar from './SLAProgressBar';

/* ─── Icons ─── */
const ClockIcon = () => (
  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

/* ─── Time helper ─── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * TicketCard — Studio template card style with ring borders and neutral palette
 */
export default function TicketCard({ ticket, onClick, index = 0, selected, onSelect, onEmailClick }) {
  const { status, priority, subject, name, agent, createdAt, type } = ticket;

  const sc = getStatusConfig(status);
  const pc = getPriorityConfig(priority);
  const sla = getSLAStatus(ticket);

  const handleCheckbox = (e) => {
    e.stopPropagation();
    onSelect?.(ticket);
  };

  return (
    <div
      className={`relative rounded-3xl p-6 ring-1 transition cursor-pointer group ${
        selected
          ? 'ring-neutral-950 bg-neutral-50'
          : 'ring-neutral-950/5 hover:bg-neutral-50'
      } animate-fade-in`}
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
      onClick={() => onClick?.(ticket)}
    >
      {/* Checkbox */}
      <div
        className={`absolute top-4 left-4 transition-opacity ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          onClick={handleCheckbox}
          className={`size-5 rounded border-2 flex items-center justify-center transition cursor-pointer ${
            selected
              ? 'bg-neutral-950 border-neutral-950'
              : 'border-neutral-300 hover:border-neutral-400 bg-white'
          }`}
        >
          {selected && (
            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-base font-semibold text-neutral-950 line-clamp-2 group-hover:text-neutral-700 transition-colors">
          {subject || 'No subject'}
        </h3>
        <span className="shrink-0 inline-flex items-center gap-x-1.5 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
          <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${sc.dot.replace('bg-', 'fill-')}`}>
            <circle r={3} cx={3} cy={3} />
          </svg>
          {sc.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 mb-3">
        <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-950">
          <UserIcon />
          {name || 'Unknown'}
        </span>
        {ticket.phone && (
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {ticket.phone}
          </span>
        )}
        {ticket.course && (
          <span className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-medium text-neutral-600">
            {ticket.course}{ticket.batchTiming ? ` — ${ticket.batchTiming}` : ''}
          </span>
        )}
        {createdAt && (
          <span className="inline-flex items-center gap-1 text-neutral-400">
            <ClockIcon />
            {timeAgo(createdAt)}
          </span>
        )}
      </div>

      {/* Description Snippet */}
      {ticket.description && (
        <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
          {ticket.description.replace(/<[^>]*>/g, '').slice(0, 120)}…
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-950/5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
            <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${pc.dot.replace('bg-', 'fill-')}`}>
              <circle r={3} cx={3} cy={3} />
            </svg>
            {pc.label}
          </span>
          {/* SLA progress bar */}
          <SLAProgressBar sla={sla} compact />
          {type && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
              {type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {ticket.email && (
            <button
              title="Email User"
              onClick={(e) => { e.stopPropagation(); onEmailClick?.(ticket); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition cursor-pointer"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Reply
            </button>
          )}
          {agent && (
            <span className="text-sm text-neutral-600 flex items-center gap-1.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[0.625rem] font-medium text-neutral-950">
                {agent.charAt(0).toUpperCase()}
              </span>
              {agent}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
export function TicketCardSkeleton() {
  return (
    <div className="rounded-3xl ring-1 ring-neutral-950/5 p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-5 w-3/5 rounded skeleton-shimmer" />
        <div className="h-6 w-20 rounded-full skeleton-shimmer" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-4 w-24 rounded skeleton-shimmer" />
        <div className="h-4 w-16 rounded skeleton-shimmer" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-neutral-950/5">
        <div className="h-5 w-14 rounded-full skeleton-shimmer" />
        <div className="h-5 w-20 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}
