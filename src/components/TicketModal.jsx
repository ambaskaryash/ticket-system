import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatusConfig, getPriorityConfig } from './StatsCard';

/* ─── Icons ─── */
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const AGENTS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

export default function TicketModal({ ticket, onClose, onUpdate }) {
  const [status, setStatus] = useState('');
  const [agent, setAgent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);

  /* ── Populate fields on open ── */
  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || ticket.Status || 'Open');
      setAgent(ticket.agent || ticket.Agent || ticket.assignedAgent || '');
    }
  }, [ticket]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (ticket) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [ticket]);

  /* ── Close animation ── */
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  /* ── Overlay click ── */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  /* ── Keyboard close ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(ticket.id || ticket.ID, {
        status,
        agent,
        Status: status,
        Agent: agent,
      });
      handleClose();
    } catch {
      // toast handled by hook
    } finally {
      setSaving(false);
    }
  };

  if (!ticket) return null;

  const name = ticket.name || ticket.Name || ticket.userName || 'Unknown';
  const email = ticket.email || ticket.Email || '';
  const subject = ticket.subject || ticket.Subject || 'No subject';
  const description = ticket.description || ticket.Description || ticket.message || ticket.Message || '';
  const priority = ticket.priority || ticket.Priority || 'medium';
  const createdAt = ticket.createdAt || ticket.CreatedAt || ticket.timestamp || ticket.Timestamp || '';
  const ticketId = ticket.id || ticket.ID || '';

  const sc = getStatusConfig(status);
  const pc = getPriorityConfig(priority);

  const hasChanged =
    status !== (ticket.status || ticket.Status || 'Open') ||
    agent !== (ticket.agent || ticket.Agent || ticket.assignedAgent || '');

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm ${
        isClosing ? 'animate-overlay-in [animation-direction:reverse]' : 'animate-overlay-in'
      }`}
    >
      {/* ── Drawer Panel ── */}
      <div
        className={`relative w-full max-w-lg h-full flex flex-col bg-dark-900 border-l border-dark-700/50 shadow-2xl ${
          isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
      >
        {/* ─ Header ─ */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-indigo/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-dark-400 text-xs font-medium">Ticket</span>
              <p className="text-white text-sm font-semibold">#{ticketId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-white transition-colors cursor-pointer"
          >
            <XIcon />
          </button>
        </div>

        {/* ─ Content ─ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Subject */}
          <div>
            <h2 className="text-white text-lg font-bold leading-snug mb-2">{subject}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${pc.bg} ${pc.text}`}>
                {pc.label} Priority
              </span>
            </div>
          </div>

          {/* Detail fields */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Reporter" value={name} />
            <DetailField label="Email" value={email} />
            <DetailField label="Created" value={createdAt ? new Date(createdAt).toLocaleString() : '—'} />
            <DetailField label="Assigned Agent" value={agent || 'Unassigned'} />
          </div>

          {/* Description */}
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-2">
              Description
            </label>
            <div className="glass-panel p-4 text-sm text-dark-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {description || 'No description provided.'}
            </div>
          </div>

          {/* Editable fields */}
          <div className="border-t border-dark-700/50 pt-5 space-y-4">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Ticket
            </h3>

            {/* Status selector */}
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-dark-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent selector */}
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                Assign Agent
              </label>
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none"
              >
                <option value="" className="bg-dark-900">Unassigned</option>
                {AGENTS.map((a) => (
                  <option key={a} value={a} className="bg-dark-900">
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─ Footer ─ */}
        <div className="p-5 border-t border-dark-700/50 flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-600/30 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanged || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SaveIcon />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-component ─── */
function DetailField({ label, value }) {
  return (
    <div>
      <span className="text-dark-500 text-[11px] font-medium uppercase tracking-wider block mb-0.5">
        {label}
      </span>
      <span className="text-dark-300 text-sm truncate block">{value || '—'}</span>
    </div>
  );
}
