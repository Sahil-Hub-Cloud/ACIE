import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { StatusIndicator } from '../shared/ui/StatusIndicator';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';

interface LoginProps {
  onNavigate: (path: string) => void;
}

const LoginContent: React.FC<LoginProps> = ({ onNavigate }) => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('Login must be used within an AuthProvider');
  }

  const { login, authenticated, loading, error, clearError } = auth;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors when inputs change
  useEffect(() => {
    if (error) clearError();
    if (localError) setLocalError(null);
  }, [email, password]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authenticated) {
      onNavigate('/dashboard');
    }
  }, [authenticated, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setLocalError('Please fill in all credentials fields.');
      return;
    }

    try {
      await login(cleanEmail, password);
      onNavigate('/dashboard');
    } catch (err: any) {
      // Error is caught by AuthProvider and exposed via context
      console.warn('Login attempt rejected:', err.message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Background Neon Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[140px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-cyan-500/5 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Core Branding Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            Access Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-widest">
            AI Change Impact Engine (ACIE)
          </p>
        </div>

        {/* Glassmorphic Portal Form */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message Panel */}
            {displayError && (
              <div className="rounded-xl border border-rose-950/40 bg-rose-950/15 p-3.5 text-xs text-rose-400 font-mono flex items-start space-x-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Operator Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@acie.dev"
                className="w-full rounded-xl border border-slate-900 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-655 focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Operator Password
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-900 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-655 focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  {/* Neon Spinner */}
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying Node...</span>
                </div>
              ) : (
                <span>Authenticate Operator</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer info: connection status and quick tips */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-3 font-mono text-[10px] text-slate-500">
          <div className="flex items-center space-x-2 bg-slate-950/30 border border-slate-900/60 rounded-full px-4 py-1">
            <span>SaaS Connection:</span>
            <StatusIndicator state={loading ? 'syncing' : 'healthy'} showLabel />
          </div>
          <p className="text-center text-[9px] text-slate-600 max-w-xs leading-relaxed">
            Authorized operation context only. All transaction telemetry is logged in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  return (
    <ErrorBoundary variant="app">
      <LoginContent onNavigate={onNavigate} />
    </ErrorBoundary>
  );
};

export default Login;
