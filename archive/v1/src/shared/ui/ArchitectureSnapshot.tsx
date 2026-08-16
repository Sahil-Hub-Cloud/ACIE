import React from 'react';

export const ArchitectureSnapshot: React.FC = () => {
  return (
    <div className="relative w-full rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md overflow-hidden">
      {/* Outer Glow Highlights */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-violet-500/5 blur-3xl" />

      {/* Title Header */}
      <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-500">
        <span className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>System Topology Map</span>
        </span>
        <span className="text-cyan-400 font-semibold">Active Snapshot</span>
      </div>

      {/* Scalable SVG Architecture Visualizer */}
      <div className="relative w-full overflow-x-auto scrollbar-thin">
        <svg
          viewBox="0 0 760 180"
          className="w-full min-w-[640px] h-auto text-slate-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definitions for Glows and Gradients */}
          <defs>
            {/* Box Gradients */}
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="violet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
            </linearGradient>

            {/* Glowing Stroke Effects */}
            <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-violet" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection Lines (Paths with running flow animations) */}
          {/* Client -> Gateway */}
          <path d="M 110,90 H 210" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle r="3" fill="#22d3ee" filter="url(#neon-glow-cyan)">
            <animateMotion path="M 110,90 H 210" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Gateway -> Service 1 (Auth) */}
          <path d="M 310,90 C 340,90 340,50 370,50" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle r="2.5" fill="#a78bfa" filter="url(#neon-glow-violet)">
            <animateMotion path="M 310,90 C 340,90 340,50 370,50" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Gateway -> Service 2 (Payment) */}
          <path d="M 310,90 C 340,90 340,130 370,130" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle r="2.5" fill="#a78bfa" filter="url(#neon-glow-violet)">
            <animateMotion path="M 310,90 C 340,90 340,130 370,130" dur="3.5s" repeatCount="indefinite" />
          </circle>

          {/* Service 1 -> Database */}
          <path d="M 480,50 C 510,50 510,90 540,90" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle r="3" fill="#22d3ee" filter="url(#neon-glow-cyan)">
            <animateMotion path="M 480,50 C 510,50 510,90 540,90" dur="3.2s" repeatCount="indefinite" />
          </circle>

          {/* Service 2 -> Database */}
          <path d="M 480,130 C 510,130 510,90 540,90" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle r="3" fill="#22d3ee" filter="url(#neon-glow-cyan)">
            <animateMotion path="M 480,130 C 510,130 510,90 540,90" dur="2.8s" repeatCount="indefinite" />
          </circle>

          {/* Database -> Telemetry Hub */}
          <path d="M 640,90 H 710" stroke="#1e293b" strokeWidth="2" fill="none" />

          {/* ================= NODES ================= */}

          {/* Node 1: Client Node */}
          <g transform="translate(10, 60)">
            <rect width="100" height="60" rx="8" fill="url(#cyan-gradient)" stroke="#0891b2" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="50" y="28" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="1">CLIENT</text>
            <text x="50" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">Browser Portal</text>
            <circle cx="50" cy="8" r="2" fill="#10b981" />
          </g>

          {/* Node 2: API Gateway */}
          <g transform="translate(210, 60)">
            <rect width="100" height="60" rx="8" fill="url(#indigo-gradient)" stroke="#4f46e5" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="50" y="28" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="1">API GATEWAY</text>
            <text x="50" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">Vercel Route</text>
            <circle cx="50" cy="8" r="2" fill="#10b981" />
          </g>

          {/* Node 3a: Auth Service */}
          <g transform="translate(370, 20)">
            <rect width="110" height="60" rx="8" fill="url(#violet-gradient)" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="55" y="28" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">AUTH-SERVICE</text>
            <text x="55" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">JWT Validator</text>
            <circle cx="55" cy="8" r="2" fill="#10b981" />
          </g>

          {/* Node 3b: Core Service */}
          <g transform="translate(370, 100)">
            <rect width="110" height="60" rx="8" fill="url(#violet-gradient)" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="55" y="28" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">ACIE-CORE</text>
            <text x="55" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">Dependency Mesh</text>
            <circle cx="55" cy="8" r="2" fill="#10b981" />
          </g>

          {/* Node 4: Telemetry Database */}
          <g transform="translate(540, 60)">
            <rect width="100" height="60" rx="8" fill="url(#cyan-gradient)" stroke="#0891b2" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="50" y="28" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="1">DB STORE</text>
            <text x="50" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">JSONBin Hub</text>
            <circle cx="50" cy="8" r="2" fill="#10b981" />
          </g>

          {/* Outer Status Terminal Indicator (nominal check status) */}
          <g transform="translate(710, 75)">
            <circle cx="15" cy="15" r="10" fill="#022c22" stroke="#059669" strokeWidth="1.5" />
            <circle cx="15" cy="15" r="4" fill="#34d399">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {/* Metric Health Bar overlay below SVG */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500">Pipeline Status:</span>
          <span className="text-emerald-400 font-semibold">NOMINAL</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-500">Sync:</span>
          <span className="text-cyan-400 font-semibold">100% REALTIME</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureSnapshot;
