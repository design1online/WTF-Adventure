import Animation from './animation';

describe('Animation', () => {
  let anim;

  beforeEach(() => {
    anim = new Animation('walk_down', 4, 1, 32, 32);
  });

  test('constructor sets all properties', () => {
    expect(anim.name).toBe('walk_down');
    expect(anim.length).toBe(4);
    expect(anim.row).toBe(1);
    expect(anim.width).toBe(32);
    expect(anim.height).toBe(32);
    expect(anim.speed).toBe(1000);
    expect(anim.count).toBe(0);
    expect(anim.endCountCallback).toBeNull();
  });

  test('reset() resets currentFrame to initial values', () => {
    anim.tick();
    anim.reset();
    expect(anim.currentFrame.index).toBe(0);
    expect(anim.currentFrame.x).toBe(0);
    expect(anim.currentFrame.y).toBe(anim.row * anim.height);
    expect(anim.lastTime).toBe(0);
  });

  test('tick() advances frame index', () => {
    anim.tick();
    expect(anim.currentFrame.index).toBe(1);
    expect(anim.currentFrame.x).toBe(32);
  });

  test('tick() wraps back to 0 after last frame', () => {
    anim.currentFrame.index = 3; // last index for length=4
    anim.tick();
    expect(anim.currentFrame.index).toBe(0);
  });

  test('tick() decrements count and calls callback at 0', () => {
    const cb = jest.fn();
    anim.setCount(1, cb);
    // Go to last frame, then tick to trigger count
    anim.currentFrame.index = 3;
    anim.tick(); // index wraps to 0, count becomes 0, callback fired
    expect(cb).toHaveBeenCalled();
  });

  test('setSpeed() updates speed', () => {
    anim.setSpeed(200);
    expect(anim.speed).toBe(200);
  });

  test('setRow() updates row', () => {
    anim.setRow(3);
    expect(anim.row).toBe(3);
  });

  test('setCount() sets count and callback', () => {
    const cb = jest.fn();
    anim.setCount(5, cb);
    expect(anim.count).toBe(5);
    expect(anim.endCountCallback).toBe(cb);
  });

  test('update() returns false when not ready', () => {
    anim.lastTime = 1000;
    expect(anim.update(1050)).toBe(false);
  });

  test('update() returns true and ticks when ready', () => {
    anim.setSpeed(100);
    anim.lastTime = 0;
    expect(anim.update(200)).toBe(true);
  });

  test('update() sets lastTime to 0 for attack animation when lastTime is 0', () => {
    const attackAnim = new Animation('atk_down', 3, 2, 32, 32);
    attackAnim.setSpeed(100);
    attackAnim.update(500);
    expect(attackAnim.lastTime).toBe(500);
  });
});
