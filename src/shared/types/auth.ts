export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  organization?: string;
  title?: string;
}

export interface AuthState {
  user: UserProfile | null;
  authenticated: boolean;
  loading: boolean;
}
