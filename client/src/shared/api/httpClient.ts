export interface ApiErrorPayload {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class HttpClientError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'HttpClientError';
    this.status = status;
    this.payload = payload;
  }
}

export type RequestInterceptor = (input: RequestInfo | URL, init: RequestInit) =>
  | Promise<{ input: RequestInfo | URL; init: RequestInit }>
  | { input: RequestInfo | URL; init: RequestInit };

export type ResponseInterceptor = <T>(response: ApiResponse<T>) => Promise<ApiResponse<T>> | ApiResponse<T>;

function normalizeBaseUrl(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.replace(/\/$/, '');

  if (trimmed === '' || trimmed === '/api' || trimmed.endsWith('/api')) {
    return trimmed || '/api';
  }

  return `${trimmed}/api`;
}

class HttpClient {
  private readonly baseUrl: string;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(url: string, init?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...init, method: 'GET' });
  }

  async post<T, B = unknown>(url: string, body?: B, init?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...init, method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
  }

  async put<T, B = unknown>(url: string, body?: B, init?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...init, method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
  }

  async patch<T, B = unknown>(url: string, body?: B, init?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...init, method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined });
  }

  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...init, method: 'DELETE' });
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const requestUrl = `${this.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    let requestInput: RequestInfo | URL = requestUrl;
    let requestInit: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      ...init,
    };

    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(requestInput, requestInit);
      requestInput = result.input;
      requestInit = result.init;
    }

    const response = await fetch(requestInput, requestInit);
    const responsePayload = await this.parseResponse(response);

    if (!response.ok) {
      const message =
        (typeof responsePayload === 'object' && responsePayload && 'error' in responsePayload && responsePayload.error) ||
        (typeof responsePayload === 'object' && responsePayload && 'message' in responsePayload && responsePayload.message) ||
        `HTTP ${response.status}`;

      throw new HttpClientError(String(message), response.status, (responsePayload ?? undefined) as ApiErrorPayload | undefined);
    }

    let transformed: ApiResponse<T> = {
      data: responsePayload as T,
      status: response.status,
      headers: response.headers,
    };

    for (const interceptor of this.responseInterceptors) {
      transformed = await interceptor(transformed);
    }

    return transformed.data;
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }
}

const defaultApiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export const httpClient = new HttpClient(defaultApiBaseUrl);

httpClient.addRequestInterceptor(async (input, init) => ({ input, init }));
httpClient.addResponseInterceptor(async (response) => response);
