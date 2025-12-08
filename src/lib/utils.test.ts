import { describe, it, expect } from 'vitest';
import { cn, getInitials } from './utils';

describe('cn', () => {
  it('should merge classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conflicting classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });
});

describe('getInitials', () => {
    it('should return initials from two words', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return initials from more than two words', () => {
        expect(getInitials('John Fitzgerald Kennedy')).toBe('JK');
    });

    it('should return the first two letters of a single word', () => {
        expect(getInitials('User')).toBe('US');
    });

    it('should handle an empty string', () => {
        expect(getInitials('')).toBe('');
    });
});
