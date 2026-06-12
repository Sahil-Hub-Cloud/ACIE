import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationConfig, NavItem } from '../../NavigationConfig';
import { NavIcon } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}) => {
  const handleNavClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-200 shadow-2xl"
          >
            {/* Header with Brand & Close Button */}
            <div className="flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950/50 px-6 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-sans text-base font-bold tracking-tight text-white">
                    ACIE <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 rounded-full px-2 py-0.5 ml-1">v1.2</span>
                  </h1>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
              {navigationConfig.map((item: NavItem) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-slate-900 border-l-2 border-cyan-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]'
                        : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border-l-2 border-transparent'
                    }`}
                  >
                    <NavIcon
                      name={item.icon}
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.name}</span>
                    {isActive && (
                      <span className="absolute right-4 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Status Info Footer */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/30 font-mono text-[11px] text-slate-500">
              <div className="flex items-center justify-between">
                <span>Engine Status:</span>
                <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default MobileDrawer;
