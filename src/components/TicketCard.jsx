import { getStatusConfig, getPriorityConfig } from './StatsCard';

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

export default function TicketCard({ ticket, onClick, index = 0 }) {
  const status = ticket.status || ticket.Status || 'open';
  const priority = ticket.priority || ticket.Priority || 'medium';
  const subject = ticket.subject || ticket.Subject || 'No subject';
  const name = ticket.name || ticket.Name || ticket.userName || 'Unknown';
  const agent = ticket.agent || ticket.Agent || ticket.assignedAgent || '';
  const createdAt = ticket.createdAt || ticket.CreatedAt || ticket.timestamp || ticket.Timestamp || '';

  const sc = getStatusConfig(status);
  const pc = getPriorityConfig(priority);

  return (
    <button
      onClick={() => onClick?.(ticket)}
      className="glass-card p-5 text-left w-full cursor-pointer group animate-fade-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent-blue transition-colors duration-200">
          {subject}
        </h3>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-dark-400 text-xs mb-4">
        <span className="inline-flex items-center gap-1">
          <UserIcon />
          {name}
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
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${pc.bg} ${pc.text}`}
        >
          {pc.label}
        </span>
        {agent && (
          <span className="text-dark-500 text-[11px] flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-accent-indigo/20 flex items-center justify-center text-accent-indigo text-[10px] font-bold uppercase">
              {agent.charAt(0)}
            </span>
            {agent}
          </span>
        )}
      </div>
    </button>
  );
}

/* ─── Skeleton ─── */
export function TicketCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
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
