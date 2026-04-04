import { useState, useMemo } from 'react';
import { useTickets, useDebouncedValue } from './hooks/useTickets';
import StatsCard, { StatsCardSkeleton } from './components/StatsCard';
import TicketCard, { TicketCardSkeleton } from './components/TicketCard';
import TicketModal from './components/TicketModal';
import ToastContainer from './components/ToastContainer';

/* ─── Filter bar icons ─── */
const SearchIcon = () => (
  <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High', 'Critical'];

export default function App() {
  const {
    tickets,
    loading,
    error,
    stats,
    fetchTickets,
    updateTicket,
    toasts,
    removeToast,
  } = useTickets();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const tStatus = (t.status || t.Status || '').toLowerCase();
      const tPriority = (t.priority || t.Priority || '').toLowerCase();
      const tName = (t.name || t.Name || t.userName || '').toLowerCase();
      const tSubject = (t.subject || t.Subject || '').toLowerCase();

      // Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!tName.includes(q) && !tSubject.includes(q)) return false;
      }
      // Status
      if (statusFilter !== 'All') {
        const normalized = tStatus.replace(/[\s_-]/g, '');
        const filterNorm = statusFilter.toLowerCase().replace(/[\s_-]/g, '');
        if (normalized !== filterNorm) return false;
      }
      // Priority
      if (priorityFilter !== 'All') {
        if (tPriority !== priorityFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [tickets, debouncedSearch, statusFilter, priorityFilter]);

  /* ── Refresh ── */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 relative">
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-blue/5 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-accent-violet/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center shadow-lg shadow-accent-blue/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ticket Dashboard
              </h1>
              <p className="text-dark-500 text-xs sm:text-sm">
                Manage and track support tickets
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800/60 hover:bg-dark-700/60 border border-dark-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshIcon spinning={refreshing} />
            Refresh
          </button>
        </header>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          ) : (
            <>
              <StatsCard label="Total Tickets" value={stats.total} color="indigo" delay={0} icon="📋" />
              <StatsCard label="Open" value={stats.open} color="blue" delay={80} icon="🔵" />
              <StatsCard label="In Progress" value={stats.inProgress} color="yellow" delay={160} icon="🟡" />
              <StatsCard label="Resolved" value={stats.resolved} color="green" delay={240} icon="✅" />
            </>
          )}
        </section>

        {/* ── Filters ── */}
        <section className="glass-panel p-4 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by name or subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/30'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_FILTERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    priorityFilter === p
                      ? 'bg-accent-violet/20 text-accent-violet ring-1 ring-accent-violet/30'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ticket count ── */}
        {!loading && (
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <p className="text-dark-500 text-sm">
              Showing <span className="text-dark-300 font-semibold">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'ticket' : 'tickets'}
              {(statusFilter !== 'All' || priorityFilter !== 'All' || debouncedSearch) && (
                <span className="text-dark-600"> (filtered)</span>
              )}
            </p>
            {(statusFilter !== 'All' || priorityFilter !== 'All' || debouncedSearch) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                }}
                className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── Ticket Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TicketCardSkeleton key={i} />)
            : filtered.map((ticket, i) => (
                <TicketCard
                  key={ticket.id || ticket.ID || i}
                  ticket={ticket}
                  index={i}
                  onClick={setSelectedTicket}
                />
              ))}
        </section>

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-dark-800/60 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-dark-400 text-lg font-semibold mb-1">No tickets found</h3>
            <p className="text-dark-600 text-sm">
              {debouncedSearch || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters or search query.'
                : 'There are no tickets to display.'}
            </p>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className="mt-6 glass-panel p-6 text-center animate-fade-in border-red-500/20">
            <p className="text-red-400 text-sm mb-3">⚠️ {error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <TicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={updateTicket}
      />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
