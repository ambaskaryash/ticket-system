import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTicketById, submitCSAT } from '../utils/api';
import Logo from '../components/Logo';

const STARS = [1, 2, 3, 4, 5];
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function RatePage() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('id');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    if (!ticketId) {
      setError('No ticket ID provided.');
      setLoading(false);
      return;
    }
    getTicketById(ticketId)
      .then((t) => {
        if (!t || !t.id) {
          setError('Ticket not found.');
        } else if (t.csatRating && String(t.csatRating).trim() !== '') {
          setTicket(t);
          setAlreadyRated(true);
        } else {
          setTicket(t);
        }
      })
      .catch(() => setError('Failed to load ticket.'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await submitCSAT(ticketId, rating, feedback);
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-accent-indigo/30 border-t-accent-indigo rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Oops!</h2>
        <p className="text-neutral-400 text-sm">{error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-neutral-400 text-sm mb-1">Your feedback has been recorded.</p>
        <div className="flex items-center justify-center gap-1 mt-4">
          {STARS.map((s) => (
            <svg key={s} className={`w-8 h-8 ${s <= rating ? 'text-amber-400' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="text-neutral-950 text-sm font-semibold mt-2">{LABELS[rating]}</p>
        <a href="/submit" className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-950 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-all">
          Back to Support
        </a>
      </div>
    );
  }

  if (alreadyRated) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Already Rated</h2>
        <p className="text-neutral-400 text-sm">You've already submitted your rating for ticket <span className="text-white font-semibold">#{ticket.id}</span>.</p>
        <div className="flex items-center justify-center gap-1 mt-4">
          {STARS.map((s) => (
            <svg key={s} className={`w-7 h-7 ${s <= parseInt(ticket.csatRating) ? 'text-amber-400' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <Logo className="w-14 h-14 mx-auto mb-4" glow />
        <h1 className="text-white text-2xl font-bold tracking-tight">Rate Your Experience</h1>
        <p className="text-neutral-400 text-sm mt-1">Ticket #{ticket.id} — "{ticket.subject}"</p>
      </div>

      {/* Rating Card */}
      <div className="rounded-2xl ring-1 ring-neutral-950/5 bg-white p-8 space-y-6">
        {/* Stars */}
        <div className="text-center">
          <p className="text-neutral-300 text-sm font-medium mb-4">How satisfied are you with the resolution?</p>
          <div className="flex items-center justify-center gap-2">
            {STARS.map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-all duration-200 hover:scale-125 cursor-pointer focus:outline-none"
              >
                <svg
                  className={`w-10 h-10 transition-colors duration-200 ${
                    s <= (hover || rating) ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-neutral-300 hover:text-neutral-500'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          {(hover || rating) > 0 && (
            <p className="text-neutral-950 text-sm font-semibold mt-3 animate-fade-in">{LABELS[hover || rating]}</p>
          )}
        </div>

        {/* Feedback */}
        <div>
          <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-2">Feedback (optional)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience…"
            rows={3}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-indigo to-accent-violet hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {submitting ? 'Submitting…' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
}
