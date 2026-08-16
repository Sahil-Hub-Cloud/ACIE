export type UserRole = 'developer' | 'manager' | 'admin';

export interface User {
  id: number;
  githubId: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  userId: number;
  username: string;
  avatarUrl: string | null;
  role: UserRole;
  token: string;
}
