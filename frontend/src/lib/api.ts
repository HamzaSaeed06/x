const BASE = '/api';

export function getToken(): string | null {
  return null; // Token handled by cookies
}
export function setToken(_token: string): void {}
export function clearToken(): void {}

class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'true' ? 'include' : 'same-origin', // ensure cookies are sent
    body: body != null ? JSON.stringify(body) : undefined,
  });

  let json: unknown;
  try { json = await res.json(); } catch { json = null; }

  if (!res.ok) {
    const err = json as Record<string, string> | null;
    throw new ApiError(err?.error ?? err?.message ?? res.statusText, res.status, json);
  }

  return json as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export { ApiError };
