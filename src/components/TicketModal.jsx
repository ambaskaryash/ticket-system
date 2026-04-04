import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatusConfig, getPriorityConfig } from './StatsCard';
import { getSLAStatus } from '../utils/sla';
import { getNotes, addNote } from '../utils/api';
import ConfirmDialog from './ConfirmDialog';

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function TicketModal({ ticket, onClose, onUpdate, onDelete, onArchive, agentNames = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const overlayRef = useRef(null);

  /* ── Populate form ── */
  useEffect(() => {
    if (ticket) {
      setForm({
        status: ticket.status || ticket.Status || 'Open',
        agent: ticket.agent || ticket.Agent || ticket.assignedAgent || '',
        name: ticket.name || ticket.Name || ticket.userName || '',
        email: ticket.email || ticket.Email || '',
        subject: ticket.subject || ticket.Subject || '',
        description: ticket.description || ticket.Description || ticket.message || ticket.Message || '',
        priority: ticket.priority || ticket.Priority || 'Medium',
      });
      setIsEditing(false);
      setActiveTab('details');
    }
  }, [ticket]);

  /* ── Fetch notes ── */
  useEffect(() => {
    if (ticket && activeTab === 'notes') {
      setNotesLoading(true);
      const ticketId = ticket.id || ticket.ID;
      getNotes(ticketId)
        .then((data) => {
          const list = Array.isArray(data) ? data : Array.isArray(data?.notes) ? data.notes : [];
          setNotes(list);
        })
        .catch(() => setNotes([]))
        .finally(() => setNotesLoading(false));
    }
  }, [ticket, activeTab]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (ticket) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [ticket]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!ticket) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ticket, handleClose]);

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(ticket.id || ticket.ID, {
        ...form,
        Status: form.status,
        Agent: form.agent,
        Priority: form.priority,
        Name: form.name,
        Email: form.email,
        Subject: form.subject,
        Description: form.description,
      });
      setIsEditing(false);
      handleClose();
    } catch {
      // toast handled by hook
    } finally {
      setSaving(false);
    }
  };

  /* ── Add note ── */
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const noteObj = {
      author: 'Admin',
      message: newNote.trim(),
      timestamp: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, noteObj]);
    setNewNote('');
    try {
      await addNote(ticket.id || ticket.ID, noteObj);
    } catch {
      // keep the optimistic note
    }
  };

  /* ── Confirm actions ── */
  const handleDelete = () => {
    setConfirmAction({
      title: 'Delete Ticket',
      message: 'This will permanently delete this ticket. This action cannot be undone.',
      confirmLabel: 'Delete',
      color: 'red',
      action: async () => {
        await onDelete(ticket.id || ticket.ID);
        setConfirmAction(null);
        handleClose();
      },
    });
  };

  const handleArchive = () => {
    setConfirmAction({
      title: 'Archive Ticket',
      message: 'This ticket will be archived and hidden from the main view. You can view archived tickets later.',
      confirmLabel: 'Archive',
      color: 'amber',
      action: async () => {
        await onArchive(ticket.id || ticket.ID);
        setConfirmAction(null);
        handleClose();
      },
    });
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (!ticket) return null;

  const ticketId = ticket.id || ticket.ID || '';
  const createdAt = ticket.createdAt || ticket.CreatedAt || ticket.timestamp || ticket.Timestamp || '';
  const sla = getSLAStatus(ticket);
  const sc = getStatusConfig(form.status);
  const pc = getPriorityConfig(form.priority);

  const hasChanged =
    form.status !== (ticket.status || ticket.Status || 'Open') ||
    form.agent !== (ticket.agent || ticket.Agent || ticket.assignedAgent || '') ||
    form.priority !== (ticket.priority || ticket.Priority || 'Medium') ||
    form.name !== (ticket.name || ticket.Name || ticket.userName || '') ||
    form.email !== (ticket.email || ticket.Email || '') ||
    form.subject !== (ticket.subject || ticket.Subject || '') ||
    form.description !== (ticket.description || ticket.Description || ticket.message || ticket.Message || '');

  return (
    <>
      <div
        ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && handleClose()}
        className={`fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm ${
          isClosing ? 'animate-overlay-in [animation-direction:reverse]' : 'animate-overlay-in'
        }`}
      >
        <div
          className={`relative w-full max-w-xl h-full flex flex-col bg-dark-900 border-l border-dark-700/50 shadow-2xl ${
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
            <div className="flex items-center gap-2">
              {/* SLA Badge */}
              {sla.status !== 'resolved' && sla.status !== 'unknown' && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  sla.status === 'breach' ? 'bg-red-500/20 text-red-400' :
                  sla.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  ⏱ {sla.label}
                </span>
              )}
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-white transition-colors cursor-pointer">
                <XIcon />
              </button>
            </div>
          </div>

          {/* ─ Tabs ─ */}
          <div className="flex border-b border-dark-700/50">
            {['details', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'text-accent-blue border-b-2 border-accent-blue'
                    : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                {tab === 'details' ? '📋 Details' : `💬 Notes ${notes.length > 0 ? `(${notes.length})` : ''}`}
              </button>
            ))}
          </div>

          {/* ─ Content ─ */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'details' ? (
              <>
                {/* Subject + badges */}
                <div>
                  {isEditing ? (
                    <input
                      value={form.subject}
                      onChange={set('subject')}
                      className="glass-input w-full px-3 py-2 text-lg font-bold text-white mb-2"
                    />
                  ) : (
                    <h2 className="text-white text-lg font-bold leading-snug mb-2">{form.subject}</h2>
                  )}
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
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Name</label>
                        <input value={form.name} onChange={set('name')} className="glass-input w-full px-3 py-2.5 text-sm" />
                      </div>
                      <div>
                        <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email</label>
                        <input value={form.email} onChange={set('email')} className="glass-input w-full px-3 py-2.5 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Description</label>
                      <textarea
                        value={form.description}
                        onChange={set('description')}
                        rows={4}
                        className="glass-input w-full px-3 py-2.5 text-sm resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Priority</label>
                        <select value={form.priority} onChange={set('priority')} className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                          {PRIORITIES.map((p) => <option key={p} value={p} className="bg-dark-900">{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Status</label>
                        <select value={form.status} onChange={set('status')} className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                          {STATUSES.map((s) => <option key={s} value={s} className="bg-dark-900">{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Assign Agent</label>
                      <select value={form.agent} onChange={set('agent')} className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                        <option value="" className="bg-dark-900">Unassigned</option>
                        {agentNames.map((a) => <option key={a} value={a} className="bg-dark-900">{a}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Reporter" value={form.name} />
                      <DetailField label="Email" value={form.email} />
                      <DetailField label="Created" value={createdAt ? new Date(createdAt).toLocaleString() : '—'} />
                      <DetailField label="Assigned Agent" value={form.agent || 'Unassigned'} />
                    </div>
                    <div>
                      <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-2">Description</label>
                      <div className="glass-panel p-4 text-sm text-dark-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                        {form.description || 'No description provided.'}
                      </div>
                    </div>

                    {ticket.attachment && (
                      <div>
                        <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-2">File Attachment</label>
                        <a 
                          href={ticket.attachment} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent-indigo hover:text-white bg-accent-indigo/10 hover:bg-accent-indigo/20 px-4 py-2 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          View Uploaded File
                        </a>
                      </div>
                    )}

                    {/* Quick edit — status + agent */}
                    <div className="border-t border-dark-700/50 pt-5 space-y-4">
                      <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Quick Update
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Status</label>
                          <select value={form.status} onChange={set('status')} className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                            {STATUSES.map((s) => <option key={s} value={s} className="bg-dark-900">{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Agent</label>
                          <select value={form.agent} onChange={set('agent')} className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                            <option value="" className="bg-dark-900">Unassigned</option>
                            {agentNames.map((a) => <option key={a} value={a} className="bg-dark-900">{a}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* ── Notes Tab ── */
              <div className="space-y-4">
                {notesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass-panel p-4 space-y-2">
                        <div className="h-3 w-24 rounded skeleton-shimmer" />
                        <div className="h-4 w-full rounded skeleton-shimmer" />
                      </div>
                    ))}
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-xl bg-dark-800/60 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-dark-500 text-sm">No notes yet. Add the first note below.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <div key={i} className="glass-panel p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-accent-indigo/20 flex items-center justify-center text-accent-indigo text-[10px] font-bold uppercase">
                            {(note.author || 'A').charAt(0)}
                          </span>
                          <span className="text-dark-300 text-xs font-semibold">{note.author || 'Admin'}</span>
                          <span className="text-dark-600 text-[10px]">
                            {note.timestamp ? new Date(note.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{note.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Add note */}
                <div className="flex gap-2">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note…"
                    className="glass-input flex-1 px-3 py-2.5 text-sm"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─ Footer ─ */}
          <div className="p-5 border-t border-dark-700/50">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isEditing ? 'Switch to View' : 'Edit All Fields'}
              </button>
              <span className="text-dark-700">·</span>
              <button
                onClick={handleArchive}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive
              </button>
              <span className="text-dark-700">·</span>
              <button
                onClick={handleDelete}
                className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
            <div className="flex items-center gap-3">
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        confirmColor={confirmAction?.color}
        onConfirm={confirmAction?.action || (() => {})}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <span className="text-dark-500 text-[11px] font-medium uppercase tracking-wider block mb-0.5">{label}</span>
      <span className="text-dark-300 text-sm truncate block">{value || '—'}</span>
    </div>
  );
}
