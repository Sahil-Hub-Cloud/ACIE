'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Github, Loader2, AlertCircle } from 'lucide-react';
import { ApiClient } from '../../../lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    // GitHub can bounce back with its own errors before we ever see a code.
    const githubError = searchParams.get('error');
    const githubErrorDescription = searchParams.get('error_description');
    if (githubError) {
      handled.current = true;
      setError(
        githubErrorDescription ||
          (githubError === 'oauth_not_configured'
            ? 'GitHub sign-in is not configured yet.'
            : `GitHub reported: ${githubError}`)
      );
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state') || undefined;
    if (code) {
      handled.current = true;
      handleGithubCallback(code, state);
    }
  }, [searchParams]);

  const handleGithubCallback = async (code: string, state?: string) => {
    setError(null);
    setStatus('Establishing secure auth token...');
    try {
      await ApiClient.login(code, state);
      // The state carries the page the user originally wanted.
      let next = '/repos';
      const encoded = state?.split(':')[1];
      if (encoded) {
        const decoded = decodeURIComponent(encoded);
        if (decoded.startsWith('/')) next = decoded;
      }
      router.replace(next);
    } catch (err) {
      setError((err as Error).message || 'GitHub authentication failed');
      setStatus('');
    }
  };

  const triggerGithubOAuth = () => {
    setError(null);
    // Server route builds the authorize URL, so no build-time public env var is needed.
    window.location.href = '/api/auth/github/authorize';
  };

  return (
    <div className="w-full max-w-md p-10 glass border-t-white/10 shadow-2xl relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 text-sm font-medium">Enter the engineering command center</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {status ? (
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <span className="text-xs text-slate-400 font-mono tracking-wider">{status}</span>
        </div>
      ) : (
        <>
          <button
            onClick={triggerGithubOAuth}
            className="w-full glass py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-white/5 transition-all border-white/10 group cursor-pointer"
          >
            <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            Sign in with GitHub
          </button>

          <p className="mt-6 text-center text-[10px] text-slate-600 leading-relaxed">
            ACIE uses GitHub as its only identity provider.
            <br />
            We request read-only access to your profile and email.
          </p>
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

      <Suspense
        fallback={
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>

      <footer className="mt-12 text-slate-700 text-[9px] font-black uppercase tracking-[0.4em] select-none">
        Secure Auth Layer // ACIE_OS_V4.0
      </footer>
    </div>
  );
}
