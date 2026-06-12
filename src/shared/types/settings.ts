export interface UserSettings {
  version: number;
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  telemetryRefreshRate: number;
}
