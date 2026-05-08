// API 客户端：封装 fetch 请求（GET/POST/DELETE/UPLOAD）
import type { ApiResponse } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? 'Request failed');
  }

  return data;
}

export function get<T>(url: string, params?: Record<string, string | number>) {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return request<T>(`${url}${qs}`);
}

export function post<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del<T>(url: string) {
  return request<T>(url, { method: 'DELETE' });
}

export async function upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data: ApiResponse<T> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error ?? 'Upload failed');
  }
  return data;
}
