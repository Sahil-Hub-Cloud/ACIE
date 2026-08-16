import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../../../shared/types';
import { ProfileCard } from './ProfileCard';
import { ActivityFeedPlaceholder } from '../placeholders/ActivityFeedPlaceholder';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-900 bg-slate-950 text-slate-200 shadow-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-widest">
                Operator Account
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                aria-label="Close panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 space-y-6 overflow-y-auto scrollbar-none pr-1">
              {user ? (
                <>
                  <ProfileCard user={user} />
                  <ActivityFeedPlaceholder />
                </>
              ) : (
                <div className="text-center text-slate-500 py-12">
                  No active session found.
                </div>
              )}
            </div>

            {/* Footer with Sign Out Action */}
            <div className="border-t border-slate-900 pt-4 mt-6">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 py-3 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-slate-900 hover:text-rose-300 hover:border-rose-950/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.08)] transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                <span>Sign Out Session</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default ProfileDrawer;
