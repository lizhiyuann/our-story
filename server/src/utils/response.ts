export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function paginated<T>(data: T[], total: number, page: number, limit: number): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: { total, page, limit },
  };
}

export function fail(error: string): ApiResponse {
  return { success: false, error };
}
