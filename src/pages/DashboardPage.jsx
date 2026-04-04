import { useState, useMemo } from 'react';
import { useDebouncedValue } from '../hooks/useTickets';
import StatsCard, { StatsCardSkeleton } from '../components/StatsCard';
import TicketCard, { TicketCardSkeleton } from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import CreateTicketModal from '../components/CreateTicketModal';
import BulkActionBar from '../components/BulkActionBar';
import ExportDropdown from '../components/ExportDropdown';
import ConfirmDialog from '../components/ConfirmDialog';

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

export default function DashboardPage({
  tickets,
  loading,
  error,
  stats,
  fetchTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  archiveTicket,
  bulkUpdate,
  showArchived,
  setShowArchived,
  agentNames,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(null);

  const debouncedSearch = useDebouncedValue(search);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const tStatus = (t.status || t.Status || '').toLowerCase();
      const tPriority = (t.priority || t.Priority || '').toLowerCase();
      const tName = (t.name || t.Name || t.userName || '').toLowerCase();
      const tSubject = (t.subject || t.Subject || '').toLowerCase();

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!tName.includes(q) && !tSubject.includes(q)) return false;
      }
      if (statusFilter !== 'All') {
        const normalized = tStatus.replace(/[\s_-]/g, '');
        const filterNorm = statusFilter.toLowerCase().replace(/[\s_-]/g, '');
        if (normalized !== filterNorm) return false;
      }
      if (priorityFilter !== 'All') {
        if (tPriority !== priorityFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [tickets, debouncedSearch, statusFilter, priorityFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  /* ── Bulk select ── */
  const toggleSelect = (ticket) => {
    const id = ticket.id || ticket.ID;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkResolve = () => {
    setBulkConfirm({
      title: `Resolve ${selectedIds.size} tickets?`,
      message: 'Selected tickets will be marked as Resolved.',
      label: 'Resolve All',
      color: 'blue',
      action: async () => {
        await bulkUpdate([...selectedIds], { status: 'Resolved', Status: 'Resolved' });
        setSelectedIds(new Set());
        setBulkConfirm(null);
      },
    });
  };

  const handleBulkAssign = async (agent) => {
    await bulkUpdate([...selectedIds], { agent, Agent: agent });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    setBulkConfirm({
      title: `Delete ${selectedIds.size} tickets?`,
      message: 'This action cannot be undone.',
      label: 'Delete All',
      color: 'red',
      action: async () => {
        for (const id of selectedIds) {
          await deleteTicket(id);
        }
        setSelectedIds(new Set());
        setBulkConfirm(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in relative z-40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
            Ticket Dashboard
          </h1>
          <p className="text-dark-500 text-xs sm:text-sm">
            Manage and track support tickets
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Archived toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              showArchived
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                : 'text-dark-400 hover:text-dark-200 bg-dark-800/60 border border-dark-600/20'
            }`}
          >
            {showArchived ? '📦 Archived ON' : '📦 Archived'}
          </button>

          <ExportDropdown tickets={filtered} />

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800/60 hover:bg-dark-700/60 border border-dark-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshIcon spinning={refreshing} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <section className="glass-panel p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
            <input
              type="text" placeholder="Search by name or subject…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === s ? 'bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/30' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40'
                }`}
              >{s}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {PRIORITY_FILTERS.map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  priorityFilter === p ? 'bg-accent-violet/20 text-accent-violet ring-1 ring-accent-violet/30' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40'
                }`}
              >{p}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Count ── */}
      {!loading && (
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-dark-500 text-sm">
            Showing <span className="text-dark-300 font-semibold">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'ticket' : 'tickets'}
            {(statusFilter !== 'All' || priorityFilter !== 'All' || debouncedSearch) && (
              <span className="text-dark-600"> (filtered)</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <span className="text-accent-blue text-xs font-semibold">{selectedIds.size} selected</span>
            )}
            {(statusFilter !== 'All' || priorityFilter !== 'All' || debouncedSearch) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); }}
                className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
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
                selected={selectedIds.has(ticket.id || ticket.ID)}
                onSelect={toggleSelect}
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
          <p className="text-dark-600 text-sm mb-4">
            {debouncedSearch || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'Try adjusting your filters or search query.'
              : 'Create your first ticket to get started.'}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 transition-all cursor-pointer"
          >
            + New Ticket
          </button>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <div className="glass-panel p-6 text-center animate-fade-in border-red-500/20">
          <p className="text-red-400 text-sm mb-3">⚠️ {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all cursor-pointer"
          >Retry</button>
        </div>
      )}

      {/* ── Modals ── */}
      <TicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={updateTicket}
        onDelete={deleteTicket}
        onArchive={archiveTicket}
        agentNames={agentNames}
      />
      <CreateTicketModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createTicket}
        agentNames={agentNames}
      />

      {/* Bulk action bar */}
      <BulkActionBar
        count={selectedIds.size}
        onMarkResolved={handleBulkResolve}
        onAssign={handleBulkAssign}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
        agentNames={agentNames}
      />

      <ConfirmDialog
        isOpen={!!bulkConfirm}
        title={bulkConfirm?.title}
        message={bulkConfirm?.message}
        confirmLabel={bulkConfirm?.label}
        confirmColor={bulkConfirm?.color}
        onConfirm={bulkConfirm?.action || (() => {})}
        onCancel={() => setBulkConfirm(null)}
      />
    </div>
  );
}
