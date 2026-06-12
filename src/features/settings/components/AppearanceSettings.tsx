import React, { useContext, useState } from 'react';
import { SettingsContext } from '../SettingsContext';

export const AppearanceSettings: React.FC = () => {
  const context = useContext(SettingsContext);
  const [importText, setImportText] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!context) return null;
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = context;

  const handleThemeChange = (theme: 'dark' | 'light' | 'system') => {
    updateSettings({ ...settings, theme });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ ...settings, telemetryRefreshRate: Number(e.target.value) });
  };

  const handleExport = () => {
    try {
      const payload = exportSettings();
      navigator.clipboard.writeText(payload);
      setFeedback({ type: 'success', text: 'Settings copied to clipboard!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to export to clipboard.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await importSettings(importText);
      setFeedback({ type: 'success', text: 'Settings imported successfully!' });
      setIsImportOpen(false);
      setImportText('');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Import parse error.' });
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
      setFeedback({ type: 'success', text: 'Settings reset to system defaults.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to reset settings.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className="space-y-2.5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Interface Theme
        </label>
        <div className="grid grid-cols-3 gap-3 font-mono">
          {(['dark', 'light', 'system'] as const).map((t) => {
            const isActive = settings.theme === t;
            return (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`rounded-xl border py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold'
                    : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Refresh Slider */}
      <div className="space-y-3">
        <div className="flex justify-between font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">
          <span>Telemetry Refresh Rate</span>
          <span className="text-cyan-400 font-bold">{settings.telemetryRefreshRate} seconds</span>
        </div>
        <input
          type="range"
          min="10"
          max="60"
          step="5"
          value={settings.telemetryRefreshRate}
          onChange={handleRateChange}
          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Maintenance Controls */}
      <div className="border-t border-slate-900 pt-6 space-y-4">
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          System Portability
        </h4>

        {feedback && (
          <div className={`rounded-xl border p-3 text-xs font-mono flex items-center space-x-2 ${
            feedback.type === 'success' 
              ? 'border-emerald-950/40 bg-emerald-950/15 text-emerald-400' 
              : 'border-rose-950/40 bg-rose-950/15 text-rose-400'
          }`}>
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="rounded-xl border border-slate-900 bg-slate-950/40 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
          >
            Export Backup
          </button>
          
          <button
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="rounded-xl border border-slate-900 bg-slate-950/40 px-4 py-2.5 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
          >
            Import Backup
          </button>

          <button
            onClick={handleReset}
            className="rounded-xl border border-rose-950/30 bg-rose-950/5 px-4 py-2.5 text-xs font-mono font-semibold text-rose-400 hover:bg-rose-950/20 transition-all"
          >
            Reset Defaults
          </button>
        </div>

        {isImportOpen && (
          <form onSubmit={handleImportSubmit} className="mt-4 space-y-3 bg-slate-950/50 p-4 border border-slate-900 rounded-xl">
            <label htmlFor="import-config" className="block font-mono text-[9px] uppercase font-bold text-slate-500">
              Paste Settings JSON Payload
            </label>
            <textarea
              id="import-config"
              rows={4}
              required
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{ "version": 1, "theme": "dark", "notifications": true, "telemetryRefreshRate": 30 }'
              className="w-full rounded-xl border border-slate-900 bg-slate-950/80 p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-all"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-mono font-semibold text-white hover:bg-cyan-500 transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-mono font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppearanceSettings;
