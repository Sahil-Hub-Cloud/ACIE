import { UserProfile } from '../types';
import { SessionStorage } from '../../auth/storage/SessionStorage';

// Mock User Database
const MOCK_USER: UserProfile = {
  id: 'usr-01',
  name: 'Administrator',
  email: 'admin@acie.dev',
  avatar: 'SA',
  organization: 'ACIE Enterprise',
  title: 'Lead Architect',
};

const MOCK_PASSWORD = 'password';

export class AuthService {
  static async login(email: string, password: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      // Simulate backend latency
      setTimeout(() => {
        const cleanEmail = email.trim().toLowerCase();
        
        if (cleanEmail === MOCK_USER.email && password === MOCK_PASSWORD) {
          SessionStorage.setSession(MOCK_USER);
          resolve(MOCK_USER);
        } else {
          reject(new Error('Invalid email or password. Use admin@acie.dev / password'));
        }
      }, 1000);
    });
  }

  static async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        SessionStorage.clearSession();
        resolve();
      }, 300);
    });
  }

  static async restoreSession(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      // Direct storage read is fast; return immediately
      const session = SessionStorage.getSession();
      resolve(session);
    });
  }
}
