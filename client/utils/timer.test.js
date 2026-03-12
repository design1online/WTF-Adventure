import Timer from './timer';

describe('Timer', () => {
  test('constructor sets time and duration', () => {
    const t = new Timer(100, 500);
    expect(t.time).toBe(100);
    expect(t.duration).toBe(500);
  });

  test('isOver() returns false before duration has elapsed', () => {
    const t = new Timer(0, 1000);
    expect(t.isOver(500)).toBe(false);
  });

  test('isOver() returns true after duration has elapsed', () => {
    const t = new Timer(0, 1000);
    expect(t.isOver(1001)).toBe(true);
  });

  test('isOver() resets time when over', () => {
    const t = new Timer(0, 1000);
    t.isOver(2000);
    expect(t.time).toBe(2000);
  });

  test('isOver() returns false on exactly equal to duration', () => {
    const t = new Timer(0, 1000);
    // time - this.time > this.duration: 1000 > 1000 is false
    expect(t.isOver(1000)).toBe(false);
  });
});
