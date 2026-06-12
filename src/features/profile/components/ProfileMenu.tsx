import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { ProfileDrawer } from './ProfileDrawer';

export const ProfileMenu: React.FC = () => {
  const auth = useContext(AuthContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!auth) return null;
  const { user, logout } = auth;

  // Fallback default values if user is null (pre-auth status or standby context)
  const displayName = user?.name || 'Guest Operator';
  const displayEmail = user?.email || 'standby@acie.dev';
  const displayAvatar = user?.avatar || displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex w-full items-center space-x-3 rounded-xl border border-slate-900 bg-slate-950/40 p-2 text-left hover:bg-slate-900/60 transition-all duration-200"
        aria-label="Open profile menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-xs font-bold text-white font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)] shrink-0">
          {displayAvatar}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-white truncate leading-4">
            {displayName}
          </span>
          <span className="block text-[9px] text-slate-500 font-mono truncate">
            {displayEmail}
          </span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-600 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Slide-out Sheet Drawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onLogout={logout}
      />
    </>
  );
};

export default ProfileMenu;
