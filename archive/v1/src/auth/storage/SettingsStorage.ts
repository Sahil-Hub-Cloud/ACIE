import { UserSettings } from '../../shared/types';

const SETTINGS_KEY = 'acie_user_settings';
const CURRENT_SETTINGS_VERSION = 1;

const DEFAULT_SETTINGS: UserSettings = {
  version: CURRENT_SETTINGS_VERSION,
  theme: 'dark',
  notifications: true,
  telemetryRefreshRate: 30,
};

export class SettingsStorage {
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      
      const parsed: UserSettings = JSON.parse(data);
      
      // Migration Strategy: if version mismatch, run migration or default reset
      if (parsed.version !== CURRENT_SETTINGS_VERSION) {
        console.warn(`Settings version mismatch: found ${parsed.version}, expected ${CURRENT_SETTINGS_VERSION}. Migrating...`);
        const migrated: UserSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          version: CURRENT_SETTINGS_VERSION, // Force active version
        };
        this.setSettings(migrated);
        return migrated;
      }
      
      return parsed;
    } catch (e) {
      console.error('Failed to parse settings from storage, returning defaults:', e);
      return DEFAULT_SETTINGS;
    }
  }

  static setSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings in storage:', e);
    }
  }

  static clearSettings(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (e) {
      console.error('Failed to clear settings from storage:', e);
    }
  }
}
export default SettingsStorage;
