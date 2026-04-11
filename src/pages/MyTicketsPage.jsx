import { useState, useMemo } from 'react';
import { useDebouncedValue } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import TicketCard, { TicketCardSkeleton } from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import EmailStudentModal from '../components/EmailStudentModal';
import { sendEmail } from '../utils/api';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High', 'Critical'];

const SearchIcon = () => (
  <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
);

export default function MyTicketsPage({
  tickets,
  loading,
  updateTicket,
  deleteTicket,
  archiveTicket,
  agentNames,
}) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [emailTicket, setEmailTicket] = useState(null);
  const debouncedSearch = useDebouncedValue(search);

  // Filter to only tickets assigned to the current logged-in agent
  const myTickets = useMemo(() => {
    return tickets.filter((t) => {
      const agentMatch =
        t.agent && user?.name && t.agent.toLowerCase() === user.name.toLowerCase();
      if (!agentMatch) return false;

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const pool = [t.name, t.subject, t.phone, t.course, t.id].join(' ').toLowerCase();
        if (!pool.includes(q)) return false;
      }
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tickets, user, debouncedSearch, statusFilter, priorityFilter]);

  // Agent-specific stats
  const stats = useMemo(() => {
    const mine = tickets.filter(
      (t) => t.agent && user?.name && t.agent.toLowerCase() === user.name.toLowerCase()
    );
    return {
      total: mine.length,
      open: mine.filter((t) => t.status === 'Open').length,
      inProgress: mine.filter((t) => t.status === 'In Progress').length,
      resolved: mine.filter((t) => t.status === 'Resolved').length,
    };
  }, [tickets, user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent-indigo/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Tickets</h1>
            <p className="text-dark-500 text-xs sm:text-sm">
              Tickets assigned to <span className="text-accent-indigo font-medium">{user?.name || 'you'}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="My Tickets" value={stats.total} color="indigo" delay={0} icon="📋" />
        <StatsCard label="Open" value={stats.open} color="blue" delay={80} icon="🔵" />
        <StatsCard label="In Progress" value={stats.inProgress} color="yellow" delay={160} icon="🟡" />
        <StatsCard label="Resolved" value={stats.resolved} color="green" delay={240} icon="✅" />
      </section>

      {/* Filters */}
      <section className="glass-panel p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
            <input
              type="text" placeholder="Search my tickets…"
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

      {/* Count */}
      {!loading && (
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-dark-500 text-sm">
            Showing <span className="text-dark-300 font-semibold">{myTickets.length}</span>{' '}
            {myTickets.length === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
      )}

      {/* Ticket Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <TicketCardSkeleton key={i} />)
          : myTickets.map((ticket, i) => (
              <TicketCard
                key={ticket.id || i}
                ticket={ticket}
                index={i}
                onClick={setSelectedTicket}
                onEmailClick={setEmailTicket}
              />
            ))}
      </section>

      {/* Empty state */}
      {!loading && myTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-dark-800/60 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-dark-400 text-lg font-semibold mb-1">No tickets assigned to you</h3>
          <p className="text-dark-600 text-sm">
            {debouncedSearch || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'Try adjusting your filters.'
              : 'Check back later or ask an admin to assign tickets.'}
          </p>
        </div>
      )}

      {/* Modals */}
      <TicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={updateTicket}
        onDelete={deleteTicket}
        onArchive={archiveTicket}
        agentNames={agentNames}
      />
      <EmailStudentModal
        ticket={emailTicket}
        onClose={() => setEmailTicket(null)}
        onSend={sendEmail}
      />
    </div>
  );
}
