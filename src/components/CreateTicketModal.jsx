import { useState, useRef, useEffect, useCallback } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function CreateTicketModal({ isOpen, onClose, onCreate, agentNames = [] }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    priority: 'Medium',
    agent: '',
  });
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', email: '', subject: '', description: '', priority: 'Medium', agent: '' });
      setTimeout(() => firstInputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) return;
    setSaving(true);
    try {
      await onCreate(form);
      handleClose();
    } catch {
      // toast handled by hook
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${
        isClosing ? 'animate-overlay-in [animation-direction:reverse]' : 'animate-overlay-in'
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-lg bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden ${
          isClosing ? 'animate-slide-out-right' : 'animate-fade-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold">New Ticket</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="John Doe"
                required
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="john@example.com"
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={set('subject')}
              placeholder="Brief description of the issue"
              required
              className="glass-input w-full px-3 py-2.5 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Detailed description of the issue…"
              rows={4}
              className="glass-input w-full px-3 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Priority + Agent row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={set('priority')}
                className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-dark-900">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Assign Agent</label>
              <select
                value={form.agent}
                onChange={set('agent')}
                className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none"
              >
                <option value="" className="bg-dark-900">Unassigned</option>
                {agentNames.map((a) => (
                  <option key={a} value={a} className="bg-dark-900">{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dark-700/50 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-600/30 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!form.name.trim() || !form.subject.trim() || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            {saving ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
