const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('EXPO_PUBLIC_API_URL is not set — API calls will fail.');
}

export class ApiClientError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  token?: string | null;
  body?: unknown; // plain object — JSON.stringify'd automatically
};

/** Thin wrapper around fetch: JSON in, JSON out, Bearer token when signed in, typed errors on non-2xx. */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiClientError(
      res.status,
      (payload && (payload as any).error) ?? `Request failed with status ${res.status}`,
      payload && (payload as any).details
    );
  }

  return payload as T;
}