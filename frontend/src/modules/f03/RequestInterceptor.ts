export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

export class RequestInterceptor {
  private static tokenGetter: (() => string | null) | null = null;

  public static setTokenGetter(getter: () => string | null) {
    this.tokenGetter = getter;
  }

  public static applyInterceptors(url: string, init: RequestInit = {}): { url: string; init: RequestInit } {
    const headers = new Headers(init.headers || {});

    // Attach Content-Type if not set
    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Attach Statutory JWT Authorization
    const token = this.tokenGetter ? this.tokenGetter() : localStorage.getItem('doca_auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Attach unique client request ID and client timestamp
    headers.set('X-Request-ID', `req-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`);
    headers.set('X-Client-Timestamp', new Date().toISOString());

    return {
      url,
      init: {
        ...init,
        headers,
      }
    };
  }
}
