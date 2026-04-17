import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GridPattern } from '../components/GridPattern';
import { FadeIn } from '../components/FadeIn';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
        // Redirect to the intended page or admin dashboard
        const redirect = searchParams.get('redirect') || '/admin';
        navigate(redirect, { replace: true });
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch {
      setError('Secure login service unreachable. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center relative overflow-hidden">
      {/* Studio GridPattern background */}
      <GridPattern
        className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
        yOffset={-96}
        interactive
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-6">
        <FadeIn>
          {/* Logo */}
          <Logo className="mx-auto h-16 w-auto mb-8" />
          <h1 className="text-center font-display text-2xl/9 font-bold tracking-tight text-neutral-950">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-base text-neutral-600">
            SkillEctEd Support & Admin Portal
          </p>
        </FadeIn>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] px-6">
        <FadeIn>
          <div className="rounded-3xl bg-white p-8 ring-1 ring-neutral-950/5 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ... (rest of the form remains unchanged) ... */}
              <div>
                <label htmlFor="username" className="block text-sm/6 font-medium text-neutral-950">
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={set('username')}
                    placeholder="e.g. admin"
                    autoFocus
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm/6 font-medium text-neutral-950">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading ? (
                  <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-neutral-400">
              Protected by SkillEctEd Support Staff Auth
            </p>
          </div>

          {/* Customer CTA */}
          <p className="mt-10 text-center text-sm text-neutral-600">
            Are you a student?{' '}
            <a href="/track" className="font-semibold text-neutral-950 hover:text-neutral-700 transition">
              Track your ticket &rarr;
            </a>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
