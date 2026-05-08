import { describe, it, expect } from 'vitest';
import { ok, paginated, fail } from '../utils/response.js';

describe('API Response helpers', () => {
  it('ok wraps data in success envelope', () => {
    const result = ok({ id: 1, name: 'test' });
    expect(result).toEqual({ success: true, data: { id: 1, name: 'test' } });
  });

  it('ok wraps null data', () => {
    const result = ok(null);
    expect(result).toEqual({ success: true, data: null });
  });

  it('paginated includes meta', () => {
    const result = paginated([{ id: 1 }], 100, 1, 20);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 100, page: 1, limit: 20 });
  });

  it('fail wraps error message', () => {
    const result = fail('Something went wrong');
    expect(result).toEqual({ success: false, error: 'Something went wrong' });
  });
});
