import { useState } from 'react';
import { getTicketById } from '../utils/api';
import { Link } from 'react-router-dom';

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
      if (!data || data.error || !data.id) {
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
      case 'In Progress': return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-dark-600/50 text-dark-300 border-dark-500';
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-indigo to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Track Your Ticket</h1>
        <p className="text-dark-500 text-sm mt-1">Check the status of your previously submitted requests.</p>
      </div>

      {!ticket ? (
        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Ticket ID <span className="text-red-400">*</span></label>
            <input
              value={form.ticketId}
              onChange={(e) => setForm(prev => ({ ...prev, ticketId: e.target.value }))}
              placeholder="e.g. TK-K1A2B"
              required
              className="glass-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email Address <span className="text-red-400">*</span></label>
            <input
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter the email used to submit the ticket"
              type="email"
              required
              className="glass-input w-full px-3 py-2.5 text-sm"
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
        <div className="glass-panel p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-dark-600/50 pb-4">
            <div>
              <h2 className="text-lg text-white font-bold">{ticket.subject}</h2>
              <p className="text-accent-blue font-mono text-sm mt-1">{ticket.id}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
          
          <div>
            <h3 className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-2">Description</h3>
            <p className="text-dark-200 text-sm whitespace-pre-wrap bg-dark-800/30 p-3 rounded-lg border border-dark-600/30">{ticket.description || "No description provided."}</p>
          </div>

          {ticket.attachment && (
            <div className="mt-4">
              <h3 className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-2">File Attachment</h3>
              <a 
                href={ticket.attachment} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent-indigo hover:text-white bg-accent-indigo/10 hover:bg-accent-indigo/20 px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                View Attachment
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm bg-dark-800/10 p-3 rounded-lg border border-dark-600/20">
            <div>
              <span className="text-dark-500 block text-xs">Priority</span>
              <span className="text-dark-200 font-medium">{ticket.priority}</span>
            </div>
            <div>
              <span className="text-dark-500 block text-xs">Last Updated</span>
              <span className="text-dark-200 font-medium">{new Date(ticket.updated).toLocaleDateString()}</span>
            </div>
          </div>

          <button 
            onClick={() => setTicket(null)} 
            className="w-full py-2.5 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors text-sm"
          >
            Search Another Ticket
          </button>
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/submit" className="text-accent-blue/70 hover:text-accent-blue text-sm transition-colors decoration-accent-blue/30 underline-offset-4 hover:underline">
          &larr; Start a new ticket
        </Link>
      </div>
    </div>
  );
}
