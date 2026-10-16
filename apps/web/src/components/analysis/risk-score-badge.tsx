'use client';

import { ShieldCheck, AlertTriangle, Flame, ShieldAlert, ShieldQuestion } from 'lucide-react';

export type BadgeRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

interface RiskScoreBadgeProps {
  level?: BadgeRiskLevel | string;
  score?: number;
}

export default function RiskScoreBadge({ level, score }: RiskScoreBadgeProps) {
  const configs = {
    critical: {
      label: 'Critical Risk',
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      icon: Flame,
    },
    high: {
      label: 'High Risk',
      bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      icon: ShieldAlert,
    },
    medium: {
      label: 'Medium Risk',
      bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      icon: AlertTriangle,
    },
    low: {
      label: 'Low Risk',
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      icon: ShieldCheck,
    },
    // Unrecognized or missing levels must never render as "Low Risk" —
    // unknown data is surfaced as unknown, not as safe.
    unknown: {
      label: 'Unknown Risk',
      bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
      icon: ShieldQuestion,
    },
  };

  const config =
    configs[level as keyof typeof configs] ?? configs.unknown;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-60 font-mono">({score})</span>
      )}
    </span>
  );
}
