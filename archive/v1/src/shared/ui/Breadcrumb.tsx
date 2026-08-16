import React from 'react';

interface BreadcrumbProps {
  currentPath: string;
  onNavigate?: (path: string) => void;
}

const routeMap: Record<string, string[]> = {
  '/': ['ACIE', 'Landing'],
  '/dashboard': ['Console', 'Dashboard'],
  '/copilot': ['Console', 'AI Copilot'],
  '/war-room': ['Security', 'War Room'],
  '/history': ['Systems', 'Logs'],
  '/executive': ['Executive', 'ROI Analysis'],
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigate }) => {
  // Find mapped segments or split standard path
  const segments = routeMap[currentPath] || 
    ['Console', ...currentPath.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1))];

  return (
    <nav className="flex items-center space-x-2 font-mono text-[11px] font-medium tracking-wider text-slate-500 uppercase">
      {/* Root Portal Icon */}
      <button 
        onClick={() => onNavigate?.('/')} 
        className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21.75h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21.75h8.25" />
        </svg>
      </button>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <React.Fragment key={index}>
            <span className="text-slate-700 select-none">/</span>
            {isLast ? (
              <span className="text-cyan-400 font-semibold tracking-normal normal-case select-none">
                {segment}
              </span>
            ) : (
              <span className="text-slate-400 transition-colors">
                {segment}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
export default Breadcrumb;
