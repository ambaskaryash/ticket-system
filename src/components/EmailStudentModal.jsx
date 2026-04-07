import { useState, useRef, useEffect, useCallback } from 'react';

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function EmailStudentModal({ ticket, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);

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
        className={`w-full max-w-lg bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden ${
          isClosing ? 'animate-zoom-in [animation-direction:reverse]' : 'animate-zoom-in'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Email Reporter</h3>
              <p className="text-dark-500 text-xs text-left">Reply to Ticket #{ticket.id}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-white transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5 pt-0">To</label>
            <div className="glass-panel px-3 py-2 text-sm text-dark-300 bg-dark-800/50">
              {ticket.name} &lt;{ticket.email}&gt;
            </div>
          </div>
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5 pt-0">Subject</label>
            <div className="glass-panel px-3 py-2 text-sm text-dark-300 bg-dark-800/50 truncate">
              [Ticket #{ticket.id}] Re: {ticket.subject}
            </div>
          </div>
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5 pt-0">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply here..."
              rows={6}
              className="glass-input w-full px-3 py-3 text-sm resize-none text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dark-700/50 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-600/30 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
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
