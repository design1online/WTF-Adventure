import Splat from './splat';

describe('Splat', () => {
  let splat;

  beforeEach(() => {
    splat = new Splat('dmg-1', 'damage', '25', 100, 200, false);
  });

  test('constructor sets properties', () => {
    expect(splat.id).toBe('dmg-1');
    expect(splat.type).toBe('damage');
    expect(splat.text).toBe('25');
    expect(splat.x).toBe(100);
    expect(splat.y).toBe(200);
    expect(splat.statique).toBe(false);
    expect(splat.opacity).toBe(1.0);
    expect(splat.speed).toBe(100);
    expect(splat.duration).toBe(1000);
  });

  test('setColours() sets fill and stroke', () => {
    splat.setColours('red', 'black');
    expect(splat.fill).toBe('red');
    expect(splat.stroke).toBe('black');
  });

  test('setDuration() overrides duration', () => {
    splat.setDuration(2000);
    expect(splat.duration).toBe(2000);
  });

  test('tick() decreases opacity and moves y up when not static', () => {
    const initialY = splat.y;
    const initialOpacity = splat.opacity;
    splat.tick();
    expect(splat.y).toBe(initialY - 1);
    expect(splat.opacity).toBeLessThan(initialOpacity);
  });

  test('tick() does not move y when static', () => {
    splat.statique = true;
    const initialY = splat.y;
    splat.tick();
    expect(splat.y).toBe(initialY);
  });

  test('tick() calls destroy when opacity < 0', () => {
    const cb = jest.fn();
    splat.onDestroy(cb);
    splat.opacity = -0.1;
    splat.tick();
    expect(cb).toHaveBeenCalledWith('dmg-1');
  });

  test('update() calls tick when enough time has elapsed', () => {
    const tick = jest.spyOn(splat, 'tick');
    splat.lastTime = 0;
    splat.update(200);
    expect(tick).toHaveBeenCalled();
  });

  test('update() does not tick when insufficient time has elapsed', () => {
    const tick = jest.spyOn(splat, 'tick');
    splat.lastTime = 1000;
    splat.update(1050);
    expect(tick).not.toHaveBeenCalled();
  });

  test('onDestroy() registers callback', () => {
    const cb = jest.fn();
    splat.onDestroy(cb);
    splat.destroy();
    expect(cb).toHaveBeenCalledWith('dmg-1');
  });

  test('destroy() does nothing when no callback registered', () => {
    expect(() => splat.destroy()).not.toThrow();
  });
});
