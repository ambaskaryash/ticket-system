import { Link, useLocation } from 'react-router-dom';

const ChevronIcon = () => (
  <svg className="size-5 shrink-0 text-neutral-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

const HomeIcon = () => (
  <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
  </svg>
);

// Route → label mapping
const ROUTE_LABELS = {
  '/admin': 'Dashboard',
  '/admin/my-tickets': 'My Tickets',
  '/admin/analytics': 'Analytics',
  '/admin/agents': 'Agents',
  '/admin/templates': 'Templates',
};

/**
 * Breadcrumbs — auto-generates from current route.
 * Accepts optional `extra` items for dynamic context (e.g. ticket ID).
 */
export default function Breadcrumbs({ extra = [] }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Build crumbs from the pathname
  const crumbs = [];

  // Always start with Dashboard
  if (pathname !== '/admin') {
    crumbs.push({ label: 'Dashboard', to: '/admin' });
  }

  // Match current route
  const currentLabel = ROUTE_LABELS[pathname];
  if (currentLabel && pathname !== '/admin') {
    crumbs.push({ label: currentLabel, to: pathname, current: true });
  }

  // Append extra items (e.g. "Ticket #123")
  if (extra.length > 0) {
    // Mark the last crumb as not current
    if (crumbs.length > 0) {
      crumbs[crumbs.length - 1].current = false;
    }
    extra.forEach((item, i) => {
      crumbs.push({ ...item, current: i === extra.length - 1 });
    });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <Link to="/admin" className="text-neutral-400 hover:text-neutral-600 transition">
            <HomeIcon />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.label} className="flex items-center">
            <ChevronIcon />
            {crumb.current ? (
              <span className="ml-2 text-sm font-medium text-neutral-950" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                className="ml-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
