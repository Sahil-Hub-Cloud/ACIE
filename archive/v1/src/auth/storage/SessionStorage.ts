import { UserProfile } from '../../shared/types';

const SESSION_KEY = 'acie_user_session';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

interface SessionPayload {
  user: UserProfile;
  createdAt: number;
}

export class SessionStorage {
  static getSession(): UserProfile | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      
      const payload: SessionPayload = JSON.parse(data);
      if (Date.now() - payload.createdAt > SESSION_DURATION_MS) {
        this.clearSession();
        return null;
      }
      return payload.user;
    } catch (e) {
      console.error('Failed to retrieve session from storage:', e);
      return null;
    }
  }

  static setSession(user: UserProfile | null): void {
    if (!user) {
      this.clearSession();
      return;
    }

    try {
      const payload: SessionPayload = {
        user,
        createdAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to set session in storage:', e);
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear session from storage:', e);
    }
  }

  static isSessionValid(): boolean {
    return this.getSession() !== null;
  }
}
