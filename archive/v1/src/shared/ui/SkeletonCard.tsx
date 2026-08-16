import React from 'react';

export type SkeletonVariant = 'metric' | 'card' | 'list' | 'graph';

export interface SkeletonCardProps {
  variant?: SkeletonVariant;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'card',
  className = '',
}) => {
  // Renders a specific structural loader based on selected variant
  const renderContent = () => {
    switch (variant) {
      case 'metric':
        return (
          <div className="space-y-4">
            <div className="h-3 w-1/3 rounded bg-slate-800/80 shimmer-bg" />
            <div className="h-8 w-2/3 rounded bg-slate-800/80 shimmer-bg" />
            <div className="h-2.5 w-1/2 rounded bg-slate-800/80 shimmer-bg" />
          </div>
        );
      case 'list':
        return (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 border-b border-slate-800/20 pb-2.5 last:border-0 last:pb-0">
                <div className="h-7 w-7 rounded-lg bg-slate-800/80 shimmer-bg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 rounded bg-slate-800/80 shimmer-bg" />
                  <div className="h-2 w-1/2 rounded bg-slate-800/80 shimmer-bg" />
                </div>
                <div className="h-3 w-12 rounded bg-slate-800/80 shimmer-bg" />
              </div>
            ))}
          </div>
        );
      case 'graph':
        return (
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-1/4 rounded bg-slate-800/80 shimmer-bg" />
              <div className="h-4 w-16 rounded bg-slate-800/80 shimmer-bg" />
            </div>
            {/* Mock Graph Waves */}
            <div className="flex-1 flex items-end space-x-2.5 pt-6 pb-2 min-h-[140px]">
              {[35, 65, 45, 80, 55, 95, 70, 85, 40, 60, 50, 75].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-t bg-slate-800/40 shimmer-bg"
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-700 font-mono">
              <div className="h-2 w-8 rounded bg-slate-850" />
              <div className="h-2 w-8 rounded bg-slate-850" />
              <div className="h-2 w-8 rounded bg-slate-850" />
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-slate-800/80 shimmer-bg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/4 rounded bg-slate-800/80 shimmer-bg" />
                <div className="h-2 w-1/3 rounded bg-slate-800/80 shimmer-bg" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="h-2.5 w-full rounded bg-slate-800/80 shimmer-bg" />
              <div className="h-2.5 w-5/6 rounded bg-slate-800/80 shimmer-bg" />
              <div className="h-2.5 w-4/5 rounded bg-slate-800/80 shimmer-bg" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-7 w-20 rounded-lg bg-slate-800/80 shimmer-bg" />
              <div className="h-3 w-12 rounded bg-slate-800/80 shimmer-bg" />
            </div>
          </div>
        );
    }
  };

  const getDimensionClass = () => {
    switch (variant) {
      case 'metric':
        return 'min-h-[112px] h-28';
      case 'list':
        return 'min-h-[144px] h-36';
      case 'graph':
        return 'min-h-[256px] h-64';
      case 'card':
      default:
        return 'min-h-[192px] h-48';
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/15 p-5 backdrop-blur-md ${getDimensionClass()} ${className}`}
      aria-hidden="true"
    >
      {/* Scoped CSS Inject for Shimmer Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(30, 41, 59, 0.4) 25%,
            rgba(51, 65, 85, 0.7) 37%,
            rgba(30, 41, 59, 0.4) 63%
          );
          background-size: 200% 100%;
          animation: custom-shimmer 1.8s infinite linear;
        }
      `}} />
      
      {renderContent()}
    </div>
  );
};

export default SkeletonCard;
