import { getStatusConfig, getPriorityConfig } from './StatsCard';
import { getSLAStatus } from '../utils/sla';

/* ─── Icons ─── */
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
 * TicketCard — uses normalized ticket fields (id, name, subject, status,
 * priority, agent, createdAt). No more fallback patterns needed.
 */
export default function TicketCard({ ticket, onClick, index = 0, selected, onSelect }) {
  const { status, priority, subject, name, agent, createdAt } = ticket;

  const sc = getStatusConfig(status);
  const pc = getPriorityConfig(priority);
  const sla = getSLAStatus(ticket);

  const handleCheckbox = (e) => {
    e.stopPropagation();
    onSelect?.(ticket);
  };

  return (
    <div
      className={`relative overflow-hidden bg-dark-900/40 backdrop-blur-md rounded-2xl border ${
        selected ? 'border-accent-blue/50 ring-2 ring-accent-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-accent-blue/5' : 'border-dark-700/30 hover:border-dark-600/50 hover:shadow-xl hover:-translate-y-1'
      } p-4 sm:p-6 text-left w-full cursor-pointer group transition-all duration-300 animate-fade-in`}
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
      onClick={() => onClick?.(ticket)}
    >
      <div className={`absolute top-0 left-0 h-full w-[3px] transition-colors ${sc.dot}`} />
      {/* Checkbox */}
      <div
        className={`absolute top-3 left-3 transition-opacity ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          onClick={handleCheckbox}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
            selected
              ? 'bg-accent-blue border-accent-blue'
              : 'border-dark-500 hover:border-dark-400 bg-transparent'
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent-blue transition-colors duration-200 pl-0">
          {subject || 'No subject'}
        </h3>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-dark-400 text-[11px] sm:text-xs mb-4 ml-1">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <UserIcon />
          {name || 'Unknown'}
        </span>
        {createdAt && (
          <span className="inline-flex items-center gap-1">
            <ClockIcon />
            {timeAgo(createdAt)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${pc.bg} ${pc.text}`}>
            {pc.label}
          </span>
          {/* SLA indicator */}
          {sla.status !== 'resolved' && sla.status !== 'unknown' && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              sla.status === 'breach' ? 'bg-red-500/20 text-red-400 animate-pulse-soft' :
              sla.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {sla.status === 'breach' ? '🔴 OVERDUE' : `⏱ ${sla.label}`}
            </span>
          )}
        </div>
        {agent && (
          <span className="text-dark-500 text-[11px] flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-accent-indigo/20 flex items-center justify-center text-accent-indigo text-[10px] font-bold uppercase">
              {agent.charAt(0)}
            </span>
            {agent}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
export function TicketCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-dark-900/20 backdrop-blur-md rounded-2xl border border-dark-700/10 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-4 w-3/5 rounded skeleton-shimmer" />
        <div className="h-6 w-20 rounded-full skeleton-shimmer" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-3 w-24 rounded skeleton-shimmer" />
        <div className="h-3 w-16 rounded skeleton-shimmer" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-14 rounded skeleton-shimmer" />
        <div className="h-5 w-20 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}
