import { describe, it, expect, vi, afterEach } from 'vitest';
import { calcCountdown, formatRelativeTime } from '../date';

describe('calcCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns expired when target is in the past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-08T12:00:00'));
    const result = calcCountdown('2026-05-01T00:00:00');
    expect(result.expired).toBe(true);
    expect(result.days).toBe(0);
  });

  it('calculates correct diff for future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-08T12:00:00'));
    const result = calcCountdown('2026-05-10T14:30:00');
    expect(result.expired).toBe(false);
    expect(result.days).toBe(2);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(30);
  });
});

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 刚刚 for recent time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-08T12:00:30'));
    expect(formatRelativeTime('2026-05-08T12:00:00')).toBe('刚刚');
  });

  it('returns minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-08T12:10:00'));
    expect(formatRelativeTime('2026-05-08T12:05:00')).toBe('5分钟前');
  });

  it('returns hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-08T15:00:00'));
    expect(formatRelativeTime('2026-05-08T12:00:00')).toBe('3小时前');
  });

  it('returns days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00'));
    expect(formatRelativeTime('2026-05-08T12:00:00')).toBe('2天前');
  });

  it('returns date string for old dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));
    const result = formatRelativeTime('2026-01-01T12:00:00');
    expect(result).toContain('2026');
  });
});
