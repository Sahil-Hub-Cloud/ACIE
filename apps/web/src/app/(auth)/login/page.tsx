'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Github, Loader2 } from 'lucide-react';
import { ApiClient } from '../../../lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleGithubCallback(code);
    }
  }, [searchParams]);

  const handleGithubCallback = async (code: string) => {
    setLoading(true);
    setStatus('Establishing secure auth token...');
    try {
      await ApiClient.login(code);
      router.push('/');
    } catch (err) {
      setError((err as Error).message || 'GitHub Authentication failed');
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus('Authorizing identity session...');

    try {
      // For demo, we support admin@acie.dev with any password, or simulate login
      // Try GitHub OAuth first — manual login is disabled in production
      throw new Error('Please use GitHub OAuth to sign in.');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const triggerGithubOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      setError('GitHub OAuth is not configured. Set NEXT_PUBLIC_GITHUB_CLIENT_ID in your environment and rebuild.');
      return;
    }
    const scope = 'read:user,user:email';
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/login` : '';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="w-full max-w-md p-10 glass border-t-white/10 shadow-2xl relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 text-sm font-medium">Enter the engineering command center</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <span className="text-xs text-slate-400 font-mono tracking-wider">{status}</span>
        </div>
      ) : (
        <>
          <form onSubmit={handleManualLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Identity / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Access Key / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all transform active:scale-[0.98] tracking-widest text-xs select-none">
              AUTHORIZE SESSION
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#020617] px-4 text-slate-600 font-black tracking-[0.3em] select-none">
                External Provider
              </span>
            </div>
          </div>

          <button
            onClick={triggerGithubOAuth}
            className="w-full glass py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-white/5 transition-all border-white/10 group cursor-pointer"
          >
            <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            Sign in with GitHub
          </button>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-bg">
      {/* Background radial art */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      {/* Branding */}
      <div className="mb-10 flex items-center gap-2 text-2xl font-extrabold select-none">
        <span className="text-accent animate-pulse">⚡</span> ACIE
      </div>

      <Suspense fallback={
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      }>
        <LoginContent />
      </Suspense>

      <footer className="mt-12 text-slate-700 text-[9px] font-black uppercase tracking-[0.4em] select-none">
        Secure Auth Layer // ACIE_OS_V4.0
      </footer>
    </div>
  );
}
