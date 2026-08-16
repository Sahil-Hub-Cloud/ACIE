'use client';

import { useEffect, useState } from 'react';
import StatsCards from '../../components/dashboard/stats-cards';
import RecentAnalyses from '../../components/dashboard/recent-analyses';
import RiskChart from '../../components/dashboard/risk-chart';
import { ApiClient } from '../../lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const overview = await ApiClient.getDashboardOverview();
        setData(overview);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-xs text-slate-500 font-mono tracking-wider">Syncing dashboard telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 rounded-2xl border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <span>Failed to sync dashboard: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview stats */}
      <StatsCards stats={data?.stats} />

      {/* Grid of charts & top risky files */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskChart data={data?.riskChart || []} />
        </div>
        
        {/* Top Risky Files card */}
        <div className="glass p-6 rounded-[24px] flex flex-col h-[320px] overflow-hidden">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Top High-Impact Files
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {(!data?.topRiskyFiles || data.topRiskyFiles.length === 0) ? (
              <p className="text-xs text-slate-500 italic mt-12 text-center">No dependency files indexed yet.</p>
            ) : (
              data.topRiskyFiles.map((file: any, idx: number) => (
                <div key={idx} className="glass-inner p-3 rounded-xl border border-white/5 bg-slate-950/20 flex justify-between items-center hover:border-white/10 transition-colors">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate max-w-[180px] font-mono">
                      {file.filePath.split('/').pop()}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate max-w-[180px]">
                      {file.filePath}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 uppercase tracking-wide">
                    {file.importCount} imports
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent audits table */}
      <RecentAnalyses analyses={data?.recentAnalyses || []} />
    </div>
  );
}
