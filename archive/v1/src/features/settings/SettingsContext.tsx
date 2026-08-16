import React, { createContext, useState, useEffect } from 'react';
import { UserSettings } from '../../shared/types';
import { SettingsService } from '../../shared/services/SettingsService';

export interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
  loading: boolean;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>({
    version: 1,
    theme: 'dark',
    notifications: true,
    telemetryRefreshRate: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await SettingsService.getSettings();
        setSettings(stored);
        applyTheme(stored.theme);
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const applyTheme = (theme: 'dark' | 'light' | 'system') => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      await SettingsService.saveSettings(newSettings);
      setSettings(newSettings);
      applyTheme(newSettings.theme);
    } catch (e) {
      console.error('Failed to save settings:', e);
      throw e;
    }
  };

  const resetSettings = async () => {
    const defaultSettings: UserSettings = {
      version: 1,
      theme: 'dark',
      notifications: true,
      telemetryRefreshRate: 30,
    };
    try {
      await SettingsService.saveSettings(defaultSettings);
      setSettings(defaultSettings);
      applyTheme(defaultSettings.theme);
    } catch (e) {
      console.error('Failed to reset settings:', e);
      throw e;
    }
  };

  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (settingsJson: string) => {
    try {
      const parsed = JSON.parse(settingsJson);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON format.');
      }
      
      const validated: UserSettings = {
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        theme: ['dark', 'light', 'system'].includes(parsed.theme) ? parsed.theme : 'dark',
        notifications: typeof parsed.notifications === 'boolean' ? parsed.notifications : true,
        telemetryRefreshRate: typeof parsed.telemetryRefreshRate === 'number' ? parsed.telemetryRefreshRate : 30,
      };

      await SettingsService.saveSettings(validated);
      setSettings(validated);
      applyTheme(validated.theme);
    } catch (e) {
      console.error('Failed to import settings:', e);
      throw new Error(e instanceof Error ? e.message : 'Invalid settings JSON');
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    loading,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsProvider;
