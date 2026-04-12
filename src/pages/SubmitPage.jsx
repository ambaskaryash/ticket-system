import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    phone: '',
    course: '',
    batchTiming: '',
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
          <h2 className="text-neutral-950 text-2xl font-bold mb-2">Ticket Submitted!</h2>
          <p className="text-neutral-400 text-sm mb-4">
            Your support ticket has been created. We'll get back to you as soon as possible.
          </p>
          <div className="rounded-2xl ring-1 ring-neutral-950/5 bg-white inline-block px-6 py-3 mb-6">
            <span className="text-neutral-500 text-xs uppercase tracking-wider block">Ticket ID</span>
            <span className="text-neutral-950 text-lg font-bold">{ticketId}</span>
          </div>
          <div>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: '', email: '', subject: '', description: '', priority: 'Medium', attachment: null, attachmentName: '', attachmentMimeType: '', phone: '', course: '', batchTiming: '' });
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-neutral-950 bg-neutral-950 hover:bg-neutral-800 transition-all cursor-pointer"
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
      {/* Top Navigation */}
      <div className="flex justify-end gap-3 mb-8">
        <Link 
          to="/track" 
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-600 ring-1 ring-neutral-300 ring-inset hover:bg-neutral-50 transition"
        >
          Track Ticket
        </Link>
        <Link 
          to="/admin/login" 
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-600 ring-1 ring-neutral-300 ring-inset hover:bg-neutral-50 transition"
        >
          Admin Login
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <Logo className="w-12 h-12 mx-auto mb-6" />
        <h1 className="font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">Submit a Ticket</h1>
        <p className="mt-2 text-lg text-neutral-600">Need help? Fill out the form below and our team will assist you.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl ring-1 ring-neutral-950/5 bg-white p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="John Doe"
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email</label>
            <input
              value={form.email}
              onChange={set('email')}
              placeholder="john@example.com"
              type="email"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Phone Number</label>
            <input
              value={form.phone}
              onChange={set('phone')}
              placeholder="+1 234 567 8900"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Course</label>
            <input
              value={form.course}
              onChange={set('course')}
              placeholder="e.g., UI/UX Design"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Batch Timing</label>
            <input
              value={form.batchTiming}
              onChange={set('batchTiming')}
              placeholder="e.g., Mon-Wed 6PM"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
            />
          </div>
        </div>

        <div>
          <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            value={form.subject}
            onChange={set('subject')}
            placeholder="Brief description of your issue"
            required
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
          />
        </div>

        <div>
          <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            placeholder="Please describe your issue in detail…"
            rows={5}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 resize-none"
          />
        </div>

        <div>
          <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Attachment (Optional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Priority</label>
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
                    : 'text-neutral-400 hover:text-neutral-200 bg-neutral-100 hover:bg-neutral-700/40'
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
          className="w-full py-3 rounded-full text-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
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
        <Link to="/track" className="text-neutral-950/70 hover:text-neutral-950 text-sm transition-colors decoration-accent-blue/30 underline-offset-4 hover:underline">
          Check existing ticket status &rarr;
        </Link>
      </div>
    </div>
  );
}
