import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have testing environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});