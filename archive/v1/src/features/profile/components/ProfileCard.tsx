import React from 'react';
import { UserProfile } from '../../../shared/types';

interface ProfileCardProps {
  user: UserProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 backdrop-blur-md shadow-lg">
      <div className="flex items-center space-x-4">
        {/* Avatar badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-base font-bold text-white font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          {user.avatar || user.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-bold text-white leading-5 truncate">{user.name}</h3>
          <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate">{user.email}</p>
        </div>
      </div>

      {/* Meta specs */}
      <div className="mt-6 border-t border-slate-900 pt-4 space-y-2.5 font-sans text-xs">
        {user.title && (
          <div className="flex justify-between text-slate-400">
            <span className="text-slate-500">Title:</span>
            <span className="font-semibold text-slate-300">{user.title}</span>
          </div>
        )}
        {user.organization && (
          <div className="flex justify-between text-slate-400">
            <span className="text-slate-500">Organization:</span>
            <span className="font-semibold text-slate-300">{user.organization}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
