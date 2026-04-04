import { useEffect, useRef, useState } from 'react';

/* ─── Status helpers ─── */
const STATUS_CONFIG = {
  open: {
    label: 'Open',
    bg: 'bg-status-open/15',
    text: 'text-status-open',
    dot: 'bg-status-open',
    ring: 'ring-status-open/30',
  },
  'in progress': {
    label: 'In Progress',
    bg: 'bg-status-progress/15',
    text: 'text-status-progress',
    dot: 'bg-status-progress',
    ring: 'ring-status-progress/30',
  },
  inprogress: {
    label: 'In Progress',
    bg: 'bg-status-progress/15',
    text: 'text-status-progress',
    dot: 'bg-status-progress',
    ring: 'ring-status-progress/30',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-status-resolved/15',
    text: 'text-status-resolved',
    dot: 'bg-status-resolved',
    ring: 'ring-status-resolved/30',
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    bg: 'bg-priority-low/15',
    text: 'text-priority-low',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-priority-medium/15',
    text: 'text-priority-medium',
  },
  high: {
    label: 'High',
    bg: 'bg-priority-high/15',
    text: 'text-priority-high',
  },
  critical: {
    label: 'Critical',
    bg: 'bg-priority-critical/15',
    text: 'text-priority-critical',
  },
};

function getStatusConfig(status) {
  const key = (status || '').toLowerCase().replace(/[\s_-]+/g, '');
  // match both 'inprogress' and 'in progress'
  return (
    STATUS_CONFIG[key] ||
    STATUS_CONFIG[(status || '').toLowerCase()] ||
    STATUS_CONFIG.open
  );
}

function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[(priority || '').toLowerCase()] || PRIORITY_CONFIG.medium;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevRef.current = end;
      }
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <span className="animate-counter-pop inline-block">{display}</span>;
}

/* ─── StatsCard Component ─── */
export default function StatsCard({ label, value, icon, color, delay = 0 }) {
  const gradients = {
    blue: 'from-blue-500/20 to-blue-600/5',
    yellow: 'from-amber-500/20 to-amber-600/5',
    green: 'from-emerald-500/20 to-emerald-600/5',
    indigo: 'from-indigo-500/20 to-indigo-600/5',
  };

  const iconColors = {
    blue: 'text-blue-400',
    yellow: 'text-amber-400',
    green: 'text-emerald-400',
    indigo: 'text-indigo-400',
  };

  const borderColors = {
    blue: 'border-blue-500/20',
    yellow: 'border-amber-500/20',
    green: 'border-emerald-500/20',
    indigo: 'border-indigo-500/20',
  };

  return (
    <div
      className={`glass-card p-5 md:p-6 bg-gradient-to-br ${gradients[color] || gradients.blue} border ${borderColors[color] || ''} animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-dark-400 text-sm font-medium tracking-wide uppercase">
          {label}
        </span>
        <span
          className={`text-2xl ${iconColors[color] || 'text-blue-400'} opacity-80`}
        >
          {icon}
        </span>
      </div>
      <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        <AnimatedCounter value={value} />
      </div>
    </div>
  );
}

/* ─── StatsCard Skeleton ─── */
export function StatsCardSkeleton() {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 rounded skeleton-shimmer" />
        <div className="h-7 w-7 rounded skeleton-shimmer" />
      </div>
      <div className="h-10 w-16 rounded skeleton-shimmer" />
    </div>
  );
}

/* ─── Re-export helpers for other components ─── */
export { getStatusConfig, getPriorityConfig, AnimatedCounter };
