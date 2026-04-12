import { useState, useMemo } from 'react';
import { useDebouncedValue } from '../hooks/useTickets';
import StatsCard, { StatsCardSkeleton } from '../components/StatsCard';
import TicketCard, { TicketCardSkeleton } from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import CreateTicketModal from '../components/CreateTicketModal';
import BulkActionBar from '../components/BulkActionBar';
import ExportDropdown from '../components/ExportDropdown';
import ConfirmDialog from '../components/ConfirmDialog';
import EmailStudentModal from '../components/EmailStudentModal';
import { FadeIn, FadeInStagger } from '../components/FadeIn';
import { sendEmail } from '../utils/api';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High', 'Critical'];

const inputClasses = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6";

export default function DashboardPage({
  tickets, loading, error, stats, fetchTickets, createTicket, updateTicket,
  deleteTicket, archiveTicket, bulkUpdate, showArchived, setShowArchived,
  page, setPage, pageSize, total, agentNames,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [emailTicket, setEmailTicket] = useState(null);
  const [showBulkResolveModal, setShowBulkResolveModal] = useState(false);
  const [bulkResolvingReason, setBulkResolvingReason] = useState('');

  const debouncedSearch = useDebouncedValue(search);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const searchPool = [t.name, t.subject, t.phone, t.course, t.batchTiming, t.id].join(' ').toLowerCase();
        if (!searchPool.includes(q)) return false;
      }
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tickets, debouncedSearch, statusFilter, priorityFilter]);

  const handleRefresh = async () => { setRefreshing(true); await fetchTickets(); setRefreshing(false); };

  const toggleSelect = (ticket) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticket.id)) next.delete(ticket.id); else next.add(ticket.id);
      return next;
    });
  };

  const handleBulkResolve = () => { setBulkResolvingReason(''); setShowBulkResolveModal(true); };

  const handleBulkResolveConfirm = async () => {
    if (!bulkResolvingReason.trim()) return;
    await bulkUpdate([...selectedIds], { status: 'Resolved', Status: 'Resolved', resolvingReason: bulkResolvingReason.trim() });
    setSelectedIds(new Set()); setShowBulkResolveModal(false); setBulkResolvingReason('');
  };

  const handleBulkAssign = async (agent) => { await bulkUpdate([...selectedIds], { agent, Agent: agent }); setSelectedIds(new Set()); };

  const handleBulkDelete = () => {
    setBulkConfirm({
      title: `Delete ${selectedIds.size} tickets?`, message: 'This action cannot be undone.',
      label: 'Delete All', color: 'red',
      action: async () => { for (const id of selectedIds) await deleteTicket(id); setSelectedIds(new Set()); setBulkConfirm(null); },
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <FadeIn>
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="block font-display text-base font-semibold text-neutral-950">Overview</span>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
              Ticket Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition cursor-pointer ${
                showArchived
                  ? 'bg-neutral-950 text-white'
                  : 'bg-white text-neutral-600 ring-1 ring-neutral-300 ring-inset hover:bg-neutral-50'
              }`}
            >
              {showArchived ? 'Archive On' : 'Archive'}
            </button>
            <ExportDropdown tickets={filtered} />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-600 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 disabled:opacity-50 transition cursor-pointer"
            >
              <svg className={`size-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Ticket
            </button>
          </div>
        </header>
      </FadeIn>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard label="Total Tickets" value={stats.total} delay={0} />
            <StatsCard label="Open" value={stats.open} delay={80} />
            <StatsCard label="In Progress" value={stats.inProgress} delay={160} />
            <StatsCard label="Resolved" value={stats.resolved} delay={240} />
          </>
        )}
      </section>

      {/* ── Filters ── */}
      <FadeIn>
        <div className="rounded-2xl ring-1 ring-neutral-950/5 p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="size-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input
                type="text" placeholder="Search by name, subject, or ID…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className={`${inputClasses} !pl-10`}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition cursor-pointer">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    statusFilter === s ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >{s}</button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITY_FILTERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    priorityFilter === p ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Count ── */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing <span className="font-semibold text-neutral-950">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'ticket' : 'tickets'}
            {total > pageSize && (
              <span className="text-neutral-400"> of {total} total</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">{selectedIds.size} selected</span>
            )}
            {(statusFilter !== 'All' || priorityFilter !== 'All' || debouncedSearch) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); }}
                className="text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Ticket Grid ── */}
      <FadeInStagger>
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TicketCardSkeleton key={i} />)
            : filtered.map((ticket, i) => (
                <TicketCard
                  key={ticket.id || i}
                  ticket={ticket}
                  index={i}
                  onClick={setSelectedTicket}
                  selected={selectedIds.has(ticket.id)}
                  onSelect={toggleSelect}
                  onEmailClick={setEmailTicket}
                />
              ))}
        </section>
      </FadeInStagger>

      {/* ── Pagination ── */}
      {!loading && total > pageSize && (
        <div className="flex items-center justify-between border-t border-neutral-950/5 pt-6">
          <p className="text-sm text-neutral-600">
            Page <span className="font-semibold text-neutral-950">{page}</span> of {Math.ceil(total / pageSize)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
              <svg className="size-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-neutral-950 mb-1">No tickets found</h3>
            <p className="text-sm text-neutral-600 mb-6">
              {debouncedSearch || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters or search query.'
                : 'Create your first ticket to get started.'}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer"
            >
              Create Your First Ticket
            </button>
          </div>
        </FadeIn>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <div className="rounded-2xl ring-1 ring-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-800 mb-3">⚠️ {error}</p>
          <button onClick={handleRefresh} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition cursor-pointer">Retry</button>
        </div>
      )}

      {/* ── Modals ── */}
      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={updateTicket} onDelete={deleteTicket} onArchive={archiveTicket} agentNames={agentNames} />
      <CreateTicketModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={createTicket} agentNames={agentNames} />
      <EmailStudentModal ticket={emailTicket} onClose={() => setEmailTicket(null)} onSend={sendEmail} />

      <BulkActionBar count={selectedIds.size} onMarkResolved={handleBulkResolve} onAssign={handleBulkAssign} onDelete={handleBulkDelete} onClear={() => setSelectedIds(new Set())} agentNames={agentNames} />
      <ConfirmDialog isOpen={!!bulkConfirm} title={bulkConfirm?.title} message={bulkConfirm?.message} confirmLabel={bulkConfirm?.label} confirmColor={bulkConfirm?.color} onConfirm={bulkConfirm?.action || (() => {})} onCancel={() => setBulkConfirm(null)} />

      {/* Bulk Resolve Modal */}
      {showBulkResolveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/50 animate-overlay-in">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-white ring-1 ring-neutral-950/5 shadow-xl overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-neutral-950/5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-neutral-950">Resolve {selectedIds.size} Ticket{selectedIds.size > 1 ? 's' : ''}</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">How were these tickets resolved?</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm/6 font-medium text-neutral-950 mb-2">Resolving Reason <span className="text-red-600">*</span></label>
              <textarea value={bulkResolvingReason} onChange={(e) => setBulkResolvingReason(e.target.value)} placeholder="Describe how these tickets were resolved…" rows={4} autoFocus className={`${inputClasses} resize-none`} />
              <p className="text-xs text-neutral-400 mt-2">This reason will be recorded for all {selectedIds.size} selected ticket{selectedIds.size > 1 ? 's' : ''}.</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-5 border-t border-neutral-950/5 sm:flex-row-reverse">
              <button onClick={handleBulkResolveConfirm} disabled={!bulkResolvingReason.trim()} className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 shadow-xs hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Resolve All
              </button>
              <button onClick={() => { setShowBulkResolveModal(false); setBulkResolvingReason(''); }} className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
