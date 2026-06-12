import { UserSettings } from '../types';
import { SettingsStorage } from '../../auth/storage/SettingsStorage';

export class SettingsService {
  static async getSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
      resolve(SettingsStorage.getSettings());
    });
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    return new Promise((resolve) => {
      SettingsStorage.setSettings(settings);
      resolve();
    });
  }
}
export default SettingsService;
