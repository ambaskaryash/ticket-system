import { useState } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTickets } from './hooks/useTickets';
import { useAgents } from './hooks/useAgents';
import { useNotifications } from './hooks/useNotifications';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import ToastContainer from './components/ToastContainer';
import { GridPattern } from './components/GridPattern';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyTicketsPage from './pages/MyTicketsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AgentsPage from './pages/AgentsPage';
import TemplatesPage from './pages/TemplatesPage';
import SubmitPage from './pages/SubmitPage';
import TrackTicket from './pages/TrackTicket';
import RatePage from './pages/RatePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';

/* ═══════════════════════════════════════
   PROTECTED ROUTE GUARD
   ═══════════════════════════════════════ */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

/* ═══════════════════════════════════════
   ADMIN SHELL — requires login
   ═══════════════════════════════════════ */
function AdminShell() {
  const { user, logout, permissions } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    tickets,
    allTickets,
    loading,
    error,
    stats,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    archiveTicket,
    bulkUpdate,
    toasts,
    removeToast,
    showArchived,
    setShowArchived,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  } = useTickets();

  const { agentNames } = useAgents();

  // Notification system
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
  } = useNotifications(allTickets);

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-neutral-950/5">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden -m-2.5 rounded-full p-2.5 text-neutral-600 hover:bg-neutral-950/10 transition cursor-pointer"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Live
            </div>
            <div className="flex items-center gap-x-4">
              {/* Notification Bell */}
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                clearAll={clearAll}
                requestPermission={requestPermission}
              />
              <span className="text-sm/6 font-semibold text-neutral-950 hidden sm:block">
                {user?.name} <span className="text-neutral-400 font-normal">({permissions.roleLabel})</span>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-950/5 transition cursor-pointer"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  tickets={tickets}
                  loading={loading}
                  error={error}
                  stats={stats}
                  fetchTickets={fetchTickets}
                  createTicket={createTicket}
                  updateTicket={updateTicket}
                  deleteTicket={deleteTicket}
                  archiveTicket={archiveTicket}
                  bulkUpdate={bulkUpdate}
                  showArchived={showArchived}
                  setShowArchived={setShowArchived}
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  total={total}
                  agentNames={agentNames}
                />
              }
            />
            <Route
              path="/my-tickets"
              element={
                <MyTicketsPage
                  tickets={allTickets}
                  loading={loading}
                  updateTicket={updateTicket}
                  deleteTicket={deleteTicket}
                  archiveTicket={archiveTicket}
                  agentNames={agentNames}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsPage tickets={allTickets} />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
          </Routes>
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

/* ═══════════════════════════════════════
   PUBLIC SUBMIT PAGE — no login needed
   ═══════════════════════════════════════ */
function PublicSubmitPage() {
  return (
    <div className="min-h-screen bg-white relative">
      <GridPattern
        className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
        yOffset={-96}
        interactive
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-10">
        <SubmitPage />
      </div>
    </div>
  );
}

function PublicTrackPage() {
  return (
    <div className="min-h-screen bg-white relative">
      <GridPattern
        className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
        yOffset={-96}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <TrackTicket />
      </div>
    </div>
  );
}

function PublicRatePage() {
  return (
    <div className="min-h-screen bg-white relative">
      <GridPattern
        className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
        yOffset={-96}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <RatePage />
      </div>
    </div>
  );
}

function PublicKnowledgeBasePage() {
  return <KnowledgeBasePage />;
}

/* ═══════════════════════════════════════
   ROOT — routes public vs admin
   ═══════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <AuthProvider>
        <Routes>
          {/* Public — anyone can access without login */}
          <Route path="/submit" element={<PublicSubmitPage />} />
          <Route path="/track" element={<PublicTrackPage />} />
          <Route path="/rate" element={<PublicRatePage />} />
          <Route path="/faq" element={<PublicKnowledgeBasePage />} />
          <Route path="/" element={<Navigate to="/submit" replace />} />
          {/* Admin login — public route */}
          <Route path="/admin/login" element={<LoginPage />} />
          {/* Admin — protected by route guard */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
