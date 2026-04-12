import { useState, useMemo } from 'react';
import { useDebouncedValue } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import TicketCard, { TicketCardSkeleton } from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import EmailStudentModal from '../components/EmailStudentModal';
import { FadeIn, FadeInStagger } from '../components/FadeIn';
import Breadcrumbs from '../components/Breadcrumbs';
import { sendEmail } from '../utils/api';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High', 'Critical'];

const inputClasses = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6";

export default function MyTicketsPage({ tickets, loading, updateTicket, deleteTicket, archiveTicket, agentNames }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [emailTicket, setEmailTicket] = useState(null);
  const debouncedSearch = useDebouncedValue(search);

  const myTickets = useMemo(() => {
    return tickets.filter((t) => {
      const agentMatch = t.agent && user?.name && t.agent.toLowerCase() === user.name.toLowerCase();
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

  const stats = useMemo(() => {
    const mine = tickets.filter((t) => t.agent && user?.name && t.agent.toLowerCase() === user.name.toLowerCase());
    return {
      total: mine.length,
      open: mine.filter((t) => t.status === 'Open').length,
      inProgress: mine.filter((t) => t.status === 'In Progress').length,
      resolved: mine.filter((t) => t.status === 'Resolved').length,
    };
  }, [tickets, user]);

  return (
    <div className="space-y-8">
      <Breadcrumbs />
      {/* Header */}
      <FadeIn>
        <header>
          <span className="block font-display text-base font-semibold text-neutral-950">Personal</span>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">My Tickets</h1>
          <p className="mt-2 text-xl text-neutral-600">
            Assigned to <span className="font-semibold text-neutral-950">{user?.name || 'you'}</span>
          </p>
        </header>
      </FadeIn>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10">
        <StatsCard label="My Tickets" value={stats.total} delay={0} />
        <StatsCard label="Open" value={stats.open} delay={80} />
        <StatsCard label="In Progress" value={stats.inProgress} delay={160} />
        <StatsCard label="Resolved" value={stats.resolved} delay={240} />
      </section>

      {/* Filters */}
      <FadeIn>
        <div className="rounded-2xl ring-1 ring-neutral-950/5 p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="size-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input type="text" placeholder="Search my tickets…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClasses} !pl-10`} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition cursor-pointer">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${statusFilter === s ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{s}</button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITY_FILTERS.map((p) => (
                <button key={p} onClick={() => setPriorityFilter(p)} className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${priorityFilter === p ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-neutral-600">
          Showing <span className="font-semibold text-neutral-950">{myTickets.length}</span> {myTickets.length === 1 ? 'ticket' : 'tickets'}
        </p>
      )}

      {/* Ticket Grid */}
      <FadeInStagger>
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TicketCardSkeleton key={i} />)
            : myTickets.map((ticket, i) => (
                <TicketCard key={ticket.id || i} ticket={ticket} index={i} onClick={setSelectedTicket} onEmailClick={setEmailTicket} />
              ))}
        </section>
      </FadeInStagger>

      {/* Empty state */}
      {!loading && myTickets.length === 0 && (
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
              <svg className="size-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-neutral-950 mb-1">No tickets assigned to you</h3>
            <p className="text-sm text-neutral-600">
              {debouncedSearch || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters.'
                : 'Check back later or ask an admin to assign tickets.'}
            </p>
          </div>
        </FadeIn>
      )}

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={updateTicket} onDelete={deleteTicket} onArchive={archiveTicket} agentNames={agentNames} />
      <EmailStudentModal ticket={emailTicket} onClose={() => setEmailTicket(null)} onSend={sendEmail} />
    </div>
  );
}
