import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';
import Logo from './Logo';

const allNavItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    requiresPermission: null,
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/admin/my-tickets',
    label: 'My Tickets',
    requiresPermission: null,
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: '/admin/analytics',
    label: 'Analytics',
    requiresPermission: 'canViewAnalytics',
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/admin/agents',
    label: 'Agents',
    requiresPermission: 'canManageAgents',
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/templates',
    label: 'Templates',
    requiresPermission: 'canManageTemplates',
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    to: '/submit',
    label: 'Submit Form',
    requiresPermission: null,
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { permissions } = useAuth();

  // Filter nav items based on role permissions
  const navItems = allNavItems.filter((item) => {
    if (!item.requiresPermission) return true;
    return permissions[item.requiresPermission];
  });

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-neutral-950/50 z-30 lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out',
          'flex flex-col bg-white border-r border-neutral-200',
          collapsed ? 'w-0 lg:w-[72px] overflow-hidden' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-neutral-950/5">
          <Logo className="h-8 w-auto shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-display text-sm font-semibold text-neutral-950 whitespace-nowrap">
                SkillEctEd Support
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col px-4 py-4">
          <ul role="list" className="-mx-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={clsx(
                      'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                      isActive
                        ? 'bg-neutral-50 text-neutral-950'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span
                      className={clsx(
                        'shrink-0',
                        isActive
                          ? 'text-neutral-950'
                          : 'text-neutral-400 group-hover:text-neutral-950'
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle — desktop */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center mx-auto mb-4 p-2 rounded-full hover:bg-neutral-950/10 text-neutral-400 hover:text-neutral-950 transition cursor-pointer"
        >
          <svg className={clsx('w-5 h-5 transition-transform', !collapsed && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    </>
  );
}
