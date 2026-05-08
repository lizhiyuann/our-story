import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors.js';

describe('Error classes', () => {
  it('AppError has statusCode and message', () => {
    const err = new AppError(400, 'bad request');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad request');
    expect(err.name).toBe('AppError');
  });

  it('NotFoundError is 404', () => {
    const err = new NotFoundError('Mood');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Mood not found');
  });

  it('UnauthorizedError defaults to 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  it('ValidationError is 400', () => {
    const err = ValidationError && new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
  });
});
