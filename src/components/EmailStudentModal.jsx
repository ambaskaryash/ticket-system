import { useState, useRef, useEffect, useCallback } from 'react';
import { getTemplates } from '../utils/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function EmailStudentModal({ ticket, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [sending, setSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (ticket) {
      document.body.style.overflow = 'hidden';
      getTemplates().then(setTemplates).catch(console.error);
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

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await onSend({
        ticketId: ticket.id,
        email: ticket.email,
        subject: ticket.subject, // the backend can prefix "Re: "
        message: message.trim(),
        agentName: ticket.agent || 'Support Team',
      });
      if (res && res.error) {
        throw new Error(res.error);
      }
      handleClose();
    } catch (err) {
      alert(`Error sending email: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (!ticket) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${
        isClosing ? 'animate-overlay-in [animation-direction:reverse]' : 'animate-overlay-in'
      }`}
    >
      <div
        className={`w-full max-w-lg bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden ${
          isClosing ? 'animate-zoom-in [animation-direction:reverse]' : 'animate-zoom-in'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Email Reporter</h3>
              <p className="text-neutral-500 text-xs text-left">Reply to Ticket #{ticket.id}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-neutral-700/60 text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5 pt-0">To</label>
            <div className="rounded-2xl ring-1 ring-neutral-950/5 bg-white px-3 py-2 text-sm text-neutral-300 bg-neutral-800/50">
              {ticket.name} &lt;{ticket.email}&gt;
            </div>
          </div>
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5 pt-0">Subject</label>
            <div className="rounded-2xl ring-1 ring-neutral-950/5 bg-white px-3 py-2 text-sm text-neutral-300 bg-neutral-800/50 truncate">
              [Ticket #{ticket.id}] Re: {ticket.subject}
            </div>
          </div>
          <div>
            <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1.5 pt-0 flex justify-between items-center">
              <span>Canned Response</span>
            </label>
            <select
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
              disabled={templates.length === 0}
              onChange={(e) => {
                const tmpl = templates.find(t => t.id === e.target.value);
                if (tmpl) setMessage(tmpl.content);
                e.target.value = ""; // reset
              }}
            >
              <option value="">
                {templates.length === 0 ? "-- No templates available --" : "-- Apply a Template --"}
              </option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            {templates.length === 0 && (
               <p className="text-[10px] text-neutral-500 mt-1">If you want to use templates, please create one in the Templates page first.</p>
            )}
          </div>
          <div className="text-neutral-950 bg-white rounded-xl overflow-hidden mt-2 border border-neutral-600/30">
            <ReactQuill
              theme="snow"
              value={message}
              onChange={setMessage}
              placeholder="Type your beautifully formatted reply here..."
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'clean']
                ]
              }}
              className="h-64 pb-12"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-700/50 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600/30 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message || message === '<p><br></p>' || sending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
