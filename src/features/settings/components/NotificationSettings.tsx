import React, { useContext } from 'react';
import { SettingsContext } from '../SettingsContext';

export const NotificationSettings: React.FC = () => {
  const context = useContext(SettingsContext);
  if (!context) return null;
  const { settings, updateSettings } = context;

  const handleToggle = () => {
    updateSettings({ ...settings, notifications: !settings.notifications });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/20 p-4">
        <div className="pr-4">
          <h4 className="text-xs font-bold text-white">Enable Scan Notifications</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Receive alerts when a PR scan completes or errors occur.</p>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            settings.notifications ? 'bg-cyan-500' : 'bg-slate-800'
          }`}
          role="switch"
          aria-checked={settings.notifications}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.notifications ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
