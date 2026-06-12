import React from 'react';

export interface StatusIndicatorProps {
  state: 'healthy' | 'warning' | 'offline' | 'syncing';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  healthy: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500',
    label: 'Healthy',
    pulse: 'bg-emerald-400',
  },
  warning: {
    color: 'text-amber-400',
    bg: 'bg-amber-500',
    label: 'Warning',
    pulse: 'bg-amber-400',
  },
  offline: {
    color: 'text-rose-400',
    bg: 'bg-rose-500',
    label: 'Offline',
    pulse: 'bg-rose-400',
  },
  syncing: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500',
    label: 'Syncing',
    pulse: 'bg-cyan-400',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  state,
  showLabel = false,
  className = '',
}) => {
  const config = statusConfig[state];

  return (
    <div className={`inline-flex items-center space-x-2.5 font-mono text-xs ${className}`}>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {state === 'syncing' ? (
          // Syncing state uses a spinning dual circular ring animation
          <span className="absolute inset-0 rounded-full border border-cyan-400 border-t-transparent animate-spin" />
        ) : (
          <>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulse}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.bg}`} />
          </>
        )}
      </span>
      {showLabel && (
        <span className={`font-semibold tracking-wider uppercase text-[10px] ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
