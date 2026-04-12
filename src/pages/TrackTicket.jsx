import { useState } from 'react';
import { getTicketById } from '../utils/api';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

/**
 * TrackTicket — public page for customers to check ticket status.
 * getTicketById now returns a normalized ticket from the API layer.
 */
export default function TrackTicket() {
  const [form, setForm] = useState({ ticketId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ticketId.trim() || !form.email.trim()) return;

    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const data = await getTicketById(form.ticketId.trim());
      if (!data || !data.id) {
        throw new Error("Ticket not found.");
      }
      if (data.email.trim().toLowerCase() !== form.email.trim().toLowerCase()) {
        throw new Error("Email does not match the ticket records.");
      }
      setTicket(data);
    } catch (err) {
      setError(err.message || "Could not retrieve ticket.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'In Progress': return 'bg-neutral-950/10 text-neutral-950 border-accent-blue/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-neutral-200 text-neutral-300 border-neutral-300';
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <Logo className="w-14 h-14 mx-auto mb-4" glow />
        <h1 className="text-white text-2xl font-bold tracking-tight">Track Your Ticket</h1>
        <p className="text-neutral-500 text-sm mt-1">Check the status of your previously submitted requests.</p>
      </div>

      {!ticket ? (
        <form onSubmit={handleSubmit} className="rounded-2xl ring-1 ring-neutral-950/5 bg-white p-6 space-y-5">
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Ticket ID <span className="text-red-400">*</span></label>
            <input
              value={form.ticketId}
              onChange={(e) => setForm(prev => ({ ...prev, ticketId: e.target.value }))}
              placeholder="e.g. TK-K1A2B"
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email Address <span className="text-red-400">*</span></label>
            <input
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter the email used to submit the ticket"
              type="email"
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={!form.ticketId.trim() || !form.email.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-indigo to-purple-600 hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Search Ticket'}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl ring-1 ring-neutral-950/5 bg-white p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-neutral-600/50 pb-4">
            <div>
              <h2 className="text-lg text-white font-bold">{ticket.subject}</h2>
              <p className="text-neutral-950 font-mono text-sm mt-1">{ticket.id}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>

          <div>
            <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">Description</h3>
            <p className="text-neutral-200 text-sm whitespace-pre-wrap bg-neutral-800/30 p-3 rounded-lg border border-neutral-600/30">{ticket.description || "No description provided."}</p>
          </div>

          {ticket.attachment && (
            <div className="mt-4">
              <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">File Attachment</h3>
              <a
                href={ticket.attachment}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-neutral-950 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                View Attachment
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm bg-neutral-800/10 p-3 rounded-lg border border-neutral-600/20">
            <div>
              <span className="text-neutral-500 block text-xs">Priority</span>
              <span className="text-neutral-200 font-medium">{ticket.priority}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-xs">Created</span>
              <span className="text-neutral-200 font-medium">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>

          <button
            onClick={() => setTicket(null)}
            className="w-full py-2.5 rounded-lg border border-neutral-600 text-neutral-300 hover:text-neutral-950 hover:bg-neutral-700 transition-colors text-sm"
          >
            Search Another Ticket
          </button>
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/submit" className="text-neutral-950/70 hover:text-neutral-950 text-sm transition-colors decoration-accent-blue/30 underline-offset-4 hover:underline">
          &larr; Start a new ticket
        </Link>
      </div>
    </div>
  );
}
