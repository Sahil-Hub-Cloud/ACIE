const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiClient {
  static getPayload() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('acie_user');
    return user ? JSON.parse(user) : null;
  }

  static getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('acie_token');
  }

  static setAuth(token: string, user: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('acie_token', token);
    localStorage.setItem('acie_user', JSON.stringify(user));
  }

  static clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('acie_token');
    localStorage.removeItem('acie_user');
  }

  private static async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.clearAuth();
        window.location.href = '/login';
      }
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ── Auth API ─────────────────────────────────────────────────────────────
  static async login(code: string, state?: string) {
    const res = await this.request<{ token: string; user: any }>('/api/auth/github', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
    this.setAuth(res.token, res.user);
    return res.user;
  }

  static async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuth();
      window.location.href = '/login';
    }
  }

  static async me() {
    return this.request('/api/auth/me');
  }

  // ── Repositories API ─────────────────────────────────────────────────────
  static async getRepos() {
    return this.request('/api/repos');
  }

  static async getRepo(id: number) {
    return this.request(`/api/repos/${id}`);
  }

  static async addRepo(data: { githubId: number; name: string; owner: string; url: string; language: string; isMonorepo?: boolean; monorepoTool?: string }) {
    return this.request('/api/repos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async removeRepo(id: number) {
    return this.request(`/api/repos/${id}`, { method: 'DELETE' });
  }

  static async indexRepo(id: number) {
    return this.request(`/api/repos/${id}/index`, { method: 'POST' });
  }

  static async getRepoGraph(id: number) {
    return this.request(`/api/repos/${id}/graph`);
  }

  // ── Analysis API ─────────────────────────────────────────────────────────
  static async getAnalyses() {
    return this.request('/api/analysis');
  }

  static async getAnalysis(id: number) {
    return this.request(`/api/analysis/${id}`);
  }

  static async getAnalysisStats() {
    return this.request('/api/analysis/stats');
  }

  static async previewAnalysis(changedSymbols: any[]) {
    return this.request('/api/analysis/preview', {
      method: 'POST',
      body: JSON.stringify({ changedSymbols }),
    });
  }

  // ── Dashboard API ────────────────────────────────────────────────────────
  static async getDashboardOverview() {
    return this.request('/api/dashboard/overview');
  }
}
