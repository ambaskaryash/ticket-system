import { useState, useEffect } from 'react';
import { createTicket } from '../utils/api';
import ReCAPTCHA from 'react-google-recaptcha';
import Logo from '../components/Logo';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    priority: 'Medium',
    attachment: null,
    attachmentName: '',
    attachmentMimeType: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaVal, setCaptchaVal] = useState(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    const lastSubmit = localStorage.getItem('skillected_last_ticket_time');
    if (lastSubmit) {
      const diff = Date.now() - parseInt(lastSubmit, 10);
      const minutesRemaining = Math.max(0, 5 - Math.floor(diff / 60000)); // 5 minute cooldown
      if (minutesRemaining > 0) {
        setCooldownTime(minutesRemaining);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cooldownTime > 0) {
      setError(`Spam protection: Please wait ${cooldownTime} more minute(s) before submitting again.`);
      return;
    }
    if (!captchaVal) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    if (!form.name.trim() || !form.subject.trim()) return;
    setLoading(true);

    try {
      const payload = { ...form, status: 'Open' };
      if (form.attachment) {
        payload.attachmentBase64 = form.attachment;
      }
      const result = await createTicket(payload);
      setTicketId(result?.id || result?.ticketId || `TK-${Date.now().toString(36).toUpperCase()}`);
      localStorage.setItem('skillected_last_ticket_time', Date.now().toString());
      setCooldownTime(5); // Start the 5 minute cooldown
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setForm(prev => ({ ...prev, attachment: null, attachmentName: '', attachmentMimeType: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // FileReader results look like: "data:image/png;base64,iVBORw0KGgo..."
      // We only want the core base64 string
      const base64String = reader.result.split(',')[1];
      setForm(prev => ({
        ...prev,
        attachment: base64String,
        attachmentName: file.name,
        attachmentMimeType: file.type
      }));
    };
    reader.readAsDataURL(file);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Ticket Submitted!</h2>
          <p className="text-dark-400 text-sm mb-4">
            Your support ticket has been created. We'll get back to you as soon as possible.
          </p>
          <div className="glass-panel inline-block px-6 py-3 mb-6">
            <span className="text-dark-500 text-xs uppercase tracking-wider block">Ticket ID</span>
            <span className="text-accent-blue text-lg font-bold">{ticketId}</span>
          </div>
          <div>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: '', email: '', subject: '', description: '', priority: 'Medium', attachment: null, attachmentName: '', attachmentMimeType: '' });
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 transition-all cursor-pointer"
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <Logo className="w-14 h-14 mx-auto mb-4" glow />
        <h1 className="text-white text-2xl font-bold tracking-tight">Submit a Ticket</h1>
        <p className="text-dark-500 text-sm mt-1">Need help? Fill out the form below and our team will assist you.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
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
              value={form.email}
              onChange={set('email')}
              placeholder="john@example.com"
              type="email"
              className="glass-input w-full px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            value={form.subject}
            onChange={set('subject')}
            placeholder="Brief description of your issue"
            required
            className="glass-input w-full px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            placeholder="Please describe your issue in detail…"
            rows={5}
            className="glass-input w-full px-3 py-2.5 text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Attachment (Optional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="glass-input w-full px-3 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dark-600 file:text-dark-200 hover:file:bg-dark-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  form.priority === p
                    ? p === 'Low' ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                    : p === 'Medium' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                    : p === 'High' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                    : 'bg-red-600/20 text-red-300 ring-1 ring-red-600/30'
                    : 'text-dark-400 hover:text-dark-200 bg-dark-800/40 hover:bg-dark-700/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex justify-center py-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(val) => setCaptchaVal(val)}
            theme="dark"
          />
        </div>

        <button
          type="submit"
          disabled={!form.name.trim() || !form.subject.trim() || loading || cooldownTime > 0}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          {cooldownTime > 0 ? `Submissions Paused (${cooldownTime}m)` : loading ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>

      <div className="text-center mt-6">
        <a href="/track" className="text-accent-blue/70 hover:text-accent-blue text-sm transition-colors decoration-accent-blue/30 underline-offset-4 hover:underline">
          Check existing ticket status &rarr;
        </a>
      </div>
    </div>
  );
}
