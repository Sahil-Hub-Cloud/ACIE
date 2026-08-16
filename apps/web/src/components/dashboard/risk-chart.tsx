'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RiskChartProps {
  data: Array<{ date: string; avgScore: number; count: number }>;
}

export default function RiskChart({ data }: RiskChartProps) {
  // Fallback data if empty
  const chartData = data.length > 0 ? data : [
    { date: 'Aug 1', avgScore: 12, count: 1 },
    { date: 'Aug 5', avgScore: 24, count: 2 },
    { date: 'Aug 10', avgScore: 18, count: 1 },
    { date: 'Aug 15', avgScore: 45, count: 3 },
  ];

  return (
    <div className="glass p-6 rounded-[24px] flex flex-col h-[320px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm">PR Risk Severity Trends</h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          Average Risk Score (30 Days)
        </span>
      </div>

      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={(str) => {
                const parts = str.split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : str;
              }}
            />
            <YAxis
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(11, 15, 26, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '11px',
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="avgScore"
              name="Avg Risk Score"
              stroke="#7c3aed"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
