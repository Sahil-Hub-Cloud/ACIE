'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Zap,
  GitBranch,
  AlertTriangle,
  ChevronRight,
  Github,
  ExternalLink,
  ArrowRight,
  Eye,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect to dashboard
    const token = localStorage?.getItem('acie_token');
    if (token) router.push('/repos');
  }, [router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-bg text-[#f8fafc] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/8 blur-[150px]" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-cyan/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="text-accent text-2xl">⚡</span>
          ACIE
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Sahil-Hub-Cloud/ACIE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <button
            onClick={handleGetStarted}
            className="bg-white text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-bold mb-8 tracking-wider">
          <Zap className="w-3 h-3" />
          AI-POWERED BLAST RADIUS ANALYSIS
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
          <span className="grad-txt">Google Maps</span>
          <br />
          <span className="text-white/60">for Your Codebase</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          See what your code breaks <em>before</em> you merge. ACIE analyzes every
          Pull Request and shows you the exact blast radius of every change.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="bg-white text-black font-black px-8 py-4 rounded-xl text-sm tracking-widest hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all transform hover:scale-[1.02] flex items-center gap-2"
          >
            ADD TO GITHUB
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://github.com/Sahil-Hub-Cloud/ACIE"
            target="_blank"
            rel="noopener noreferrer"
            className="glass px-8 py-4 rounded-xl text-sm font-bold tracking-wider border-white/10 hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            VIEW SOURCE
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Every Merged PR Is a Roll of the Dice
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A developer changes a utility file. It breaks 47 downstream services.
            Production goes down at 2 AM. The company loses $50,000.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-2xl border-white/5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-bold text-sm mb-2">Blind Merges</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Engineers merge code without knowing what downstream services, routes, or
              APIs it will break.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl border-white/5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <GitBranch className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-sm mb-2">Hidden Dependencies</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              A change in a shared utility cascades through 30+ files. Nobody knows until
              it breaks in production.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl border-white/5">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-bold text-sm mb-2">No Risk Visibility</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Existing tools check code quality, but none tell you what will actually
              break when you merge.
            </p>
          </div>
        </div>
      </section>

      {/* Solution / Features Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Know Before You Merge
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            ACIE gives you a risk score, blast radius map, and actionable
            recommendations — on every PR, automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-2xl border-white/5 hover:border-accent/20 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold text-sm mb-2">Blast Radius Mapping</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              See every file, service, and API endpoint affected by your changes — up to
              10 levels deep.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl border-white/5 hover:border-cyan/20 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="font-bold text-sm mb-2">Risk Scoring</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every PR gets a 0–100 risk score based on entry points affected,
              services impacted, and dependency depth.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl border-white/5 hover:border-emerald-500/20 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm mb-2">PR Comments</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Automatic, detailed comments on every PR — no setup, no dashboards to
              check. Just actionable insights.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            How It Works
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {[
            { step: '01', title: 'Open a PR', desc: 'You push code and open a Pull Request on GitHub.' },
            { step: '02', title: 'ACIE Analyzes', desc: 'Our engine parses your code, builds the dependency graph, and calculates blast radius.' },
            { step: '03', title: 'Get the Report', desc: 'A detailed risk report is posted as a comment on your PR — score, impacted files, and recommendations.' },
          ].map((item, i) => (
            <div key={i} className="flex-1 relative">
              <div className="text-5xl font-black text-white/5 mb-3">{item.step}</div>
              <h3 className="font-bold text-sm mb-2">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              {i < 2 && (
                <ChevronRight className="hidden md:block absolute top-8 -right-4 w-5 h-5 text-white/10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="glass p-12 rounded-3xl border-white/5">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Ready to Ship Safely?
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
            Install the ACIE GitHub App and get blast radius reports on every PR in
            under 2 minutes.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-black font-black px-10 py-4 rounded-xl text-sm tracking-widest hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all transform hover:scale-[1.02] inline-flex items-center gap-2"
          >
            ADD TO GITHUB — FREE
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-accent">⚡</span> ACIE
          </div>
          <div className="flex items-center gap-6 text-slate-500 text-xs">
            <a
              href="https://github.com/Sahil-Hub-Cloud/ACIE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              Twitter
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-slate-700 text-[10px] font-mono tracking-wider">
            © 2026 ACIE — AI Change Impact Engine
          </p>
        </div>
      </footer>
    </div>
  );
}
