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
    phone: '',
    course: '',
    batchTiming: '',
  });
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', email: '', subject: '', description: '', priority: 'Medium', agent: '', phone: '', course: '', batchTiming: '' });
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

  const inputClasses = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 ${
        isClosing ? 'animate-overlay-in [animation-direction:reverse]' : 'animate-overlay-in'
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-lg rounded-3xl bg-white ring-1 ring-neutral-950/5 shadow-xl overflow-hidden ${
          isClosing ? 'animate-slide-out-right' : 'animate-fade-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-950/5">
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-950">New Ticket</h2>
            <p className="text-sm text-neutral-600 mt-0.5">Create a new support request</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-950/5 transition cursor-pointer"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm/6 font-medium text-neutral-950">
                Name <span className="text-red-600">*</span>
              </label>
              <div className="mt-2">
                <input
                  ref={firstInputRef}
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Full name"
                  required
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-neutral-950">Email</label>
              <div className="mt-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="email@example.com"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm/6 font-medium text-neutral-950">Phone</label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 00000 00000"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-neutral-950">Course</label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.course}
                  onChange={set('course')}
                  placeholder="Project name"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm/6 font-medium text-neutral-950">Batch / Timeline</label>
            <div className="mt-2">
              <input
                type="text"
                value={form.batchTiming}
                onChange={set('batchTiming')}
                placeholder="e.g. Morning Batch"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm/6 font-medium text-neutral-950">
              Subject <span className="text-red-600">*</span>
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={form.subject}
                onChange={set('subject')}
                placeholder="Brief description of the issue"
                required
                className={inputClasses}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm/6 font-medium text-neutral-950">Description</label>
            <div className="mt-2">
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Provide context for the support request…"
                rows={4}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </div>

          {/* Priority + Agent row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm/6 font-medium text-neutral-950">Priority</label>
              <div className="mt-2">
                <select
                  value={form.priority}
                  onChange={set('priority')}
                  className={`${inputClasses} cursor-pointer`}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-neutral-950">Assign Agent</label>
              <div className="mt-2">
                <select
                  value={form.agent}
                  onChange={set('agent')}
                  className={`${inputClasses} cursor-pointer`}
                >
                  <option value="">Unassigned</option>
                  {agentNames.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-neutral-950/5 flex items-center gap-3 sm:flex-row-reverse">
          <button
            type="submit"
            disabled={!form.name.trim() || !form.subject.trim() || saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-neutral-950 shadow-xs hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {saving ? (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            {saving ? 'Creating…' : 'Create Ticket'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
