const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiClient {
  /** Clears pre-cookie legacy state; the live session is an httpOnly cookie. */
  static clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('acie_token');
    localStorage.removeItem('acie_user');
  }

  private static async request<T = any>(
    path: string,
    options: RequestInit = {},
    redirectOn401 = true
  ): Promise<T> {
    const headers = new Headers(options.headers || {});

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      // The session cookie must travel even when NEXT_PUBLIC_API_URL is
      // pointed at another origin during development.
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.clearAuth();
        if (redirectOn401) window.location.href = '/login';
      }
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ── Auth API ─────────────────────────────────────────────────────────────
  static async login(code: string, state?: string) {
    const res = await this.request<{ user: any }>('/api/auth/github', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
    return res.user;
  }

  static async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' }, false);
    } finally {
      this.clearAuth();
      window.location.href = '/login';
    }
  }

  static async me(options?: { redirectOn401?: boolean }) {
    return this.request('/api/auth/me', {}, options?.redirectOn401 ?? true);
  }

  // ── Repositories API ─────────────────────────────────────────────────────
  static async getRepos() {
    return this.request('/api/repos');
  }

  static async getRepo(id: number) {
    return this.request(`/api/repos/${id}`);
  }

  static async addRepo(data: { name: string; owner: string; url: string; language: string; isMonorepo?: boolean; monorepoTool?: string }) {
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
}
