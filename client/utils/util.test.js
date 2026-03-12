import { isInt, TRANSITIONEND, isIntersecting, requestAnimFrame } from './util';

describe('util', () => {
  describe('isInt()', () => {
    it('returns true for integer', () => expect(isInt(5)).toBe(true));
    it('returns true for 0', () => expect(isInt(0)).toBe(true));
    it('returns false for float', () => expect(isInt(1.5)).toBe(false));
  });

  test('TRANSITIONEND is defined', () => {
    expect(typeof TRANSITIONEND).toBe('string');
    expect(TRANSITIONEND).toContain('transitionend');
  });

  describe('isIntersecting()', () => {
    const rectA = { left: 0, right: 10, top: 0, bottom: 10 };

    it('returns true when rectTwo is completely to the right', () => {
      expect(isIntersecting(rectA, { left: 20, right: 30, top: 0, bottom: 10 })).toBe(true);
    });

    it('returns true when rectTwo is completely to the left', () => {
      expect(isIntersecting(rectA, { left: -20, right: -5, top: 0, bottom: 10 })).toBe(true);
    });

    it('returns true when rectTwo is completely below', () => {
      expect(isIntersecting(rectA, { left: 0, right: 10, top: 20, bottom: 30 })).toBe(true);
    });

    it('returns true when rectTwo is completely above', () => {
      expect(isIntersecting(rectA, { left: 0, right: 10, top: -20, bottom: -5 })).toBe(true);
    });

    it('returns false when rects overlap', () => {
      expect(isIntersecting(rectA, { left: 5, right: 15, top: 5, bottom: 15 })).toBe(false);
    });
  });

  test('requestAnimFrame is a function', () => {
    expect(typeof requestAnimFrame).toBe('function');
  });
});
