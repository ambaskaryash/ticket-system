import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatusConfig, getPriorityConfig } from './StatsCard';
import { getSLAStatus } from '../utils/sla';
import { getNotes, addNote } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from './ConfirmDialog';
import SLAProgressBar from './SLAProgressBar';

const XIcon = () => (
  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const inputClasses = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6";

/**
 * TicketModal — Studio-styled drawer panel
 */
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
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolvingReason, setResolvingReason] = useState('');
  const { permissions } = useAuth();
  const overlayRef = useRef(null);

  /* ── Populate form from normalized ticket ── */
  useEffect(() => {
    if (ticket) {
      setForm({
        status: ticket.status || 'Open',
        agent: ticket.agent || '',
        name: ticket.name || '',
        email: ticket.email || '',
        subject: ticket.subject || '',
        description: ticket.description || '',
        priority: ticket.priority || 'Medium',
        phone: ticket.phone || '',
        course: ticket.course || '',
        batchTiming: ticket.batchTiming || '',
      });
      setIsEditing(false);
      setActiveTab('details');
    }
  }, [ticket]);

  /* ── Fetch notes ── */
  useEffect(() => {
    if (ticket && activeTab === 'notes') {
      setNotesLoading(true);
      getNotes(ticket.id)
        .then((list) => setNotes(list))
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
      const payload = {
        ...form,
        Status: form.status,
        Agent: form.agent,
        Priority: form.priority,
        Name: form.name,
        Email: form.email,
        Subject: form.subject,
        Description: form.description,
        Phone: form.phone,
        Course: form.course,
        BatchTiming: form.batchTiming,
      };
      if (form.resolvingReason) {
        payload.resolvingReason = form.resolvingReason;
      }
      await onUpdate(ticket.id, payload);
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
      await addNote(ticket.id, noteObj);
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
        await onDelete(ticket.id);
        setConfirmAction(null);
        handleClose();
      },
    });
  };

  const handleArchive = () => {
    setConfirmAction({
      title: 'Archive Ticket',
      message: 'This ticket will be archived and hidden from the main view.',
      confirmLabel: 'Archive',
      color: 'amber',
      action: async () => {
        await onArchive(ticket.id);
        setConfirmAction(null);
        handleClose();
      },
    });
  };

  /* ── Status change handler ── */
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === 'Resolved' && (ticket.status || 'Open') !== 'Resolved') {
      setResolvingReason('');
      setShowResolveModal(true);
      setForm((prev) => ({ ...prev, status: 'Resolved' }));
    } else {
      setForm((prev) => ({ ...prev, status: newStatus, resolvingReason: '' }));
    }
  };

  const handleResolveConfirm = () => {
    if (!resolvingReason.trim()) return;
    setForm((prev) => ({ ...prev, status: 'Resolved', resolvingReason: resolvingReason.trim() }));
    setShowResolveModal(false);
  };

  const handleResolveCancel = () => {
    setForm((prev) => ({ ...prev, status: ticket.status || 'Open' }));
    setResolvingReason('');
    setShowResolveModal(false);
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (!ticket) return null;

  const sla = getSLAStatus(ticket);
  const sc = getStatusConfig(form.status);
  const pc = getPriorityConfig(form.priority);

  const hasChanged =
    form.status !== (ticket.status || 'Open') ||
    form.agent !== (ticket.agent || '') ||
    form.priority !== (ticket.priority || 'Medium') ||
    form.name !== (ticket.name || '') ||
    form.email !== (ticket.email || '') ||
    form.subject !== (ticket.subject || '') ||
    form.description !== (ticket.description || '') ||
    form.phone !== (ticket.phone || '') ||
    form.course !== (ticket.course || '') ||
    form.batchTiming !== (ticket.batchTiming || '') ||
    (form.resolvingReason && form.resolvingReason !== (ticket.resolvingReason || ''));

  return (
    <>
      <div
        ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && handleClose()}
        className={`fixed inset-0 z-50 flex justify-end bg-neutral-950/50 ${
          isClosing ? 'animate-overlay-in [animation-direction:reverse]' : 'animate-overlay-in'
        }`}
      >
        <div
          className={`relative w-full max-w-xl h-full flex flex-col bg-white border-l border-neutral-950/10 shadow-xl ${
            isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
          }`}
        >
          {/* ─ Header ─ */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-950/5">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white">
                <svg className="size-5 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium">Ticket</p>
                <p className="font-display text-lg font-semibold text-neutral-950 leading-none">#{ticket.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SLAProgressBar sla={sla} compact />
              <button onClick={handleClose} className="rounded-full p-2 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-950/5 transition cursor-pointer">
                <XIcon />
              </button>
            </div>
          </div>

          {/* ─ Tabs ─ */}
          <div className="flex border-b border-neutral-950/5">
            {['details', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold transition cursor-pointer border-b-2 ${
                  activeTab === tab
                    ? 'text-neutral-950 border-neutral-950'
                    : 'text-neutral-400 border-transparent hover:text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {tab === 'details' ? 'Details' : `Notes ${notes.length > 0 ? `(${notes.length})` : ''}`}
              </button>
            ))}
          </div>

          {/* ─ Content ─ */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {activeTab === 'details' ? (
              <>
                {/* Subject + badges */}
                <div>
                  {isEditing ? (
                    <input
                      value={form.subject}
                      onChange={set('subject')}
                      className={`${inputClasses} !text-lg font-semibold mb-3`}
                    />
                  ) : (
                    <h2 className="font-display text-xl font-semibold text-neutral-950 tracking-tight mb-3">{form.subject}</h2>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${sc.dot.replace('bg-', 'fill-')}`}>
                        <circle r={3} cx={3} cy={3} />
                      </svg>
                      {sc.label}
                    </span>
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${pc.dot.replace('bg-', 'fill-')}`}>
                        <circle r={3} cx={3} cy={3} />
                      </svg>
                      {pc.label} Priority
                    </span>
                  </div>
                </div>

                {/* Detail fields */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm/6 font-medium text-neutral-950">Name</label>
                        <div className="mt-2"><input value={form.name} onChange={set('name')} className={inputClasses} /></div>
                      </div>
                      <div>
                        <label className="block text-sm/6 font-medium text-neutral-950">Email</label>
                        <div className="mt-2"><input value={form.email} onChange={set('email')} className={inputClasses} /></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm/6 font-medium text-neutral-950">Phone</label>
                        <div className="mt-2"><input value={form.phone} onChange={set('phone')} className={inputClasses} /></div>
                      </div>
                      <div>
                        <label className="block text-sm/6 font-medium text-neutral-950">Course</label>
                        <div className="mt-2"><input value={form.course} onChange={set('course')} className={inputClasses} /></div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-neutral-950">Batch Timing</label>
                      <div className="mt-2"><input value={form.batchTiming} onChange={set('batchTiming')} className={inputClasses} /></div>
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-neutral-950">Description</label>
                      <div className="mt-2"><textarea value={form.description} onChange={set('description')} rows={4} className={`${inputClasses} resize-none`} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm/6 font-medium text-neutral-950">Priority</label>
                        <div className="mt-2">
                          <select value={form.priority} onChange={set('priority')} className={`${inputClasses} cursor-pointer`}>
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm/6 font-medium text-neutral-950">Status</label>
                        <div className="mt-2">
                          <select value={form.status} onChange={handleStatusChange} className={`${inputClasses} cursor-pointer`}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm/6 font-medium text-neutral-950">Assign Agent</label>
                      <div className="mt-2">
                        <select value={form.agent} onChange={set('agent')} className={`${inputClasses} cursor-pointer`}>
                          <option value="">Unassigned</option>
                          {agentNames.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <DetailField label="Reporter" value={form.name} />
                      <DetailField label="Email" value={form.email} />
                      <DetailField label="Phone" value={form.phone} />
                      <DetailField label="Course" value={form.course} />
                      <DetailField label="Batch" value={form.batchTiming} />
                      <DetailField label="Assigned Agent" value={form.agent || 'Unassigned'} />
                      <div className="col-span-2">
                        <DetailField label="Created" value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                      <div className="rounded-2xl bg-neutral-50 ring-1 ring-neutral-950/5 p-5 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                        {form.description || 'No description provided.'}
                      </div>
                    </div>

                    {ticket.attachment && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Attachment</label>
                        <a
                          href={ticket.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          Open Attachment
                        </a>
                      </div>
                    )}

                    <div className="border-t border-neutral-950/5 pt-6 space-y-4">
                      <h3 className="text-sm font-semibold text-neutral-950">Quick Action</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm/6 font-medium text-neutral-600">Status</label>
                          <div className="mt-2">
                            <select value={form.status} onChange={handleStatusChange} className={`${inputClasses} cursor-pointer`}>
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm/6 font-medium text-neutral-600">Assign Agent</label>
                          <div className="mt-2">
                            <select value={form.agent} onChange={set('agent')} className={`${inputClasses} cursor-pointer`}>
                              <option value="">Unassigned</option>
                              {agentNames.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(ticket.resolvingReason || form.resolvingReason) && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Resolution Outcome</label>
                        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-5 text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                          <div className="flex items-start gap-3">
                            <svg className="size-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{form.resolvingReason || ticket.resolvingReason}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {ticket.csatRating && String(ticket.csatRating).trim() !== '' && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Customer Sentiment</label>
                        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-5">
                          <div className="flex items-center gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg key={s} className={`size-5 ${s <= parseInt(ticket.csatRating) ? 'text-amber-500' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                            <span className="text-sm font-semibold text-amber-700 ml-2">
                              {['', 'Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'][parseInt(ticket.csatRating)] || ''}
                            </span>
                          </div>
                          {ticket.csatFeedback && (
                            <p className="text-sm text-neutral-600 italic">"{ticket.csatFeedback}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* ── Notes Tab ── */
              <div className="space-y-4">
                {notesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-2xl ring-1 ring-neutral-950/5 p-4 space-y-2">
                        <div className="h-3 w-24 rounded skeleton-shimmer" />
                        <div className="h-4 w-full rounded skeleton-shimmer" />
                      </div>
                    ))}
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 mb-4">
                      <svg className="size-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-neutral-500">No notes yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <div key={i} className="rounded-2xl ring-1 ring-neutral-950/5 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[0.625rem] font-medium text-neutral-950">
                            {(note.author || 'A').charAt(0).toUpperCase()}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-950">{note.author || 'Admin'}</p>
                            <p className="text-xs text-neutral-400">
                              {note.timestamp ? new Date(note.timestamp).toLocaleString() : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{note.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Add note */}
                <div className="flex gap-3">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Type an internal note…"
                    className={`${inputClasses} flex-1`}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="rounded-full bg-neutral-950 px-5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─ Footer ─ */}
          <div className="px-6 py-5 border-t border-neutral-950/5">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-semibold text-neutral-600 hover:text-neutral-950 transition cursor-pointer"
              >
                {isEditing ? 'View Mode' : 'Edit'}
              </button>
              {permissions.canArchiveTickets && (
                <>
                  <span className="text-neutral-200">·</span>
                  <button onClick={handleArchive} className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition cursor-pointer">
                    Archive
                  </button>
                </>
              )}
              {permissions.canDeleteTickets && (
                <>
                  <span className="text-neutral-200">·</span>
                  <button onClick={handleDelete} className="text-sm font-semibold text-red-600 hover:text-red-700 transition cursor-pointer">
                    Delete
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanged || saving}
                className="flex-[1.5] flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-neutral-950 shadow-xs hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {saving ? (
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {showResolveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/50 animate-overlay-in">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-white ring-1 ring-neutral-950/5 shadow-xl overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-neutral-950/5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-neutral-950">Resolve Ticket</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">Finalize resolution details</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <label className="block text-sm/6 font-medium text-neutral-950 mb-2">
                Resolution Note <span className="text-red-600">*</span>
              </label>
              <textarea
                value={resolvingReason}
                onChange={(e) => setResolvingReason(e.target.value)}
                placeholder="Describe how this issue was resolved…"
                rows={4}
                autoFocus
                className={`${inputClasses} resize-none`}
              />
              <p className="text-xs text-neutral-400 mt-2 text-center">This note will be permanently logged.</p>
            </div>

            <div className="flex items-center gap-3 px-6 py-5 border-t border-neutral-950/5 sm:flex-row-reverse">
              <button
                onClick={handleResolveConfirm}
                disabled={!resolvingReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 shadow-xs hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirm Resolve
              </button>
              <button
                onClick={handleResolveCancel}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-950 bg-neutral-50 px-3 py-2 rounded-lg ring-1 ring-neutral-950/5 truncate">
        {value || '—'}
      </span>
    </div>
  );
}
