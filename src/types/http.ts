export interface RequestConfig<TPayload = unknown> {
  url: string;
  method: string;
  data?: TPayload;
  params?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UseHttpResponse<TResponse = unknown, TPayload = unknown> {
  data: TResponse | null;
  loading: boolean;
  error: string | null;
  execute: (
    method: string,
    url: string,
    payload?: TPayload,
    params?: Record<string, unknown>
  ) => Promise<TResponse | null>;
}
