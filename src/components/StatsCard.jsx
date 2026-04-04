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
  const cardThemes = {
    blue: 'border-l-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.08)] group-hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)] group-hover:border-l-blue-400',
    yellow: 'border-l-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.08)] group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.2)] group-hover:border-l-amber-400',
    green: 'border-l-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.08)] group-hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)] group-hover:border-l-emerald-400',
    indigo: 'border-l-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.08)] group-hover:shadow-[0_8px_40px_rgba(99,102,241,0.2)] group-hover:border-l-indigo-400',
  };

  const iconColors = {
    blue: 'text-blue-400 group-hover:text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    yellow: 'text-amber-400 group-hover:text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    green: 'text-emerald-400 group-hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    indigo: 'text-indigo-400 group-hover:text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]',
  };

  return (
    <div
      className={`group relative overflow-hidden bg-dark-900/60 backdrop-blur-xl rounded-2xl border border-dark-700/40 border-l-[4px] ${cardThemes[color] || cardThemes.blue} p-5 md:p-6 transition-all duration-400 transform hover:-translate-y-1.5 cursor-pointer animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-dark-400 group-hover:text-dark-300 text-xs font-bold tracking-widest uppercase transition-colors">
          {label}
        </span>
        <span
          className={`text-2xl transition-all duration-300 transform group-hover:scale-110 ${iconColors[color] || 'text-blue-400'}`}
        >
          {icon}
        </span>
      </div>
      <div className="text-3xl md:text-5xl font-black text-white tracking-tight relative z-10 drop-shadow-md">
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
