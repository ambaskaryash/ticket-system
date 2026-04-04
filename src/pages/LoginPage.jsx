import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../utils/api';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);

    try {
      const res = await apiLogin({ username: form.username.trim().toLowerCase(), password: form.password });
      if (res.success) {
        login({
          username: res.username,
          name: res.name,
          role: res.role,
          token: res.token,
        });
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Secure login service unreachable. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-blue/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-accent-violet/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4" glow />
          <h1 className="text-white text-2xl font-bold tracking-tight">Skillected Support</h1>
          <p className="text-dark-500 text-sm mt-1">Staff & Admin Login Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={set('username')}
              placeholder="admin"
              autoFocus
              className="glass-input w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              className="glass-input w-full px-4 py-3 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="text-center">
            <p className="text-dark-600 text-[10px] mt-3">
              Requires valid Google Sheet `Users` tab credentials.
            </p>
          </div>
        </form>

        {/* Customer CTA */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-dark-400 text-sm mb-3">Are you a student checking on a request?</p>
          <a href="/track" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-accent-indigo hover:text-white bg-accent-indigo/10 hover:bg-accent-indigo/20 border border-accent-indigo/20 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Track Existing Ticket
          </a>
        </div>
      </div>
    </div>
  );
}
