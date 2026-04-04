import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTickets } from './hooks/useTickets';
import { useAgents } from './hooks/useAgents';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AgentsPage from './pages/AgentsPage';
import SubmitPage from './pages/SubmitPage';
import TrackTicket from './pages/TrackTicket';

/* ═══════════════════════════════════════
   ADMIN SHELL — requires login
   ═══════════════════════════════════════ */
function AdminShell() {
  const { isAuthenticated, user, logout } = useAuth();
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
  } = useTickets();

  const { agentNames } = useAgents();

  // Not logged in → show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-dark-950 relative">
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-blue/5 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-accent-violet/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={`relative z-10 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
          }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-xl border-b border-dark-700/20">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-dark-600 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Auto-syncing
            </div>
            <div className="flex items-center gap-3">
              <span className="text-dark-400 text-xs hidden sm:block">
                {user?.name} <span className="text-dark-600">({user?.role})</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-white hover:bg-dark-700/60 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                  agentNames={agentNames}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsPage tickets={allTickets} />} />
            <Route path="/agents" element={<AgentsPage />} />
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
    <div className="min-h-screen bg-dark-950 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-blue/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-accent-violet/8 blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubmitPage />
      </div>
    </div>
  );
}

function PublicTrackPage() {
  return (
    <div className="min-h-screen bg-dark-950 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full bg-accent-indigo/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <TrackTicket />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ROOT — routes public vs admin
   ═══════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public — anyone can access without login */}
          <Route path="/submit" element={<PublicSubmitPage />} />
          <Route path="/track" element={<PublicTrackPage />} />
          <Route path="/" element={<Navigate to="/submit" replace />} />
          {/* Everything else — admin login required */}
          <Route path="/admin/*" element={<AdminShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
