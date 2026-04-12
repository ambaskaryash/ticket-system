import { useEffect, useRef, useState } from 'react';
import { Border } from './Border';
import { FadeIn } from './FadeIn';

/* ─── Status helpers ─── */
const STATUS_CONFIG = {
  open: {
    label: 'Open',
    dot: 'bg-blue-500',
  },
  'in progress': {
    label: 'In Progress',
    dot: 'bg-amber-500',
  },
  inprogress: {
    label: 'In Progress',
    dot: 'bg-amber-500',
  },
  resolved: {
    label: 'Resolved',
    dot: 'bg-emerald-500',
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    dot: 'bg-neutral-400',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High',
    dot: 'bg-red-500',
  },
  critical: {
    label: 'Critical',
    dot: 'bg-red-600',
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

  return <span className="inline-block">{display}</span>;
}

/* ─── StatsCard Component (Studio StatList pattern) ─── */
export default function StatsCard({ label, value, icon, delay = 0 }) {
  return (
    <FadeIn>
      <Border position="left" className="flex flex-col-reverse pl-8 py-2">
        <dt className="mt-2 text-base text-neutral-600">{label}</dt>
        <dd className="font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
          <AnimatedCounter value={value} />
        </dd>
      </Border>
    </FadeIn>
  );
}

/* ─── StatsCard Skeleton ─── */
export function StatsCardSkeleton() {
  return (
    <div className="pl-8 border-l border-neutral-950/10 py-2">
      <div className="h-4 w-20 rounded skeleton-shimmer mb-3" />
      <div className="h-10 w-16 rounded skeleton-shimmer" />
    </div>
  );
}

/* ─── Re-export helpers for other components ─── */
export { getStatusConfig, getPriorityConfig, AnimatedCounter };
