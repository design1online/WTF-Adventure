import Transition from './transition';

describe('Transition', () => {
  let t;

  beforeEach(() => {
    t = new Transition();
  });

  test('constructor initializes defaults', () => {
    expect(t.startValue).toBe(0);
    expect(t.endValue).toBe(0);
    expect(t.duration).toBe(0);
    expect(t.inProgress).toBe(false);
  });

  test('start() sets all properties and marks inProgress', () => {
    const update = jest.fn();
    const stop = jest.fn();
    t.start(0, update, stop, 0, 100, 500);
    expect(t.inProgress).toBe(true);
    expect(t.startValue).toBe(0);
    expect(t.endValue).toBe(100);
    expect(t.duration).toBe(500);
    expect(t.updateFunction).toBe(update);
    expect(t.stopFunction).toBe(stop);
  });

  test('stop() marks inProgress as false', () => {
    t.inProgress = true;
    t.stop();
    expect(t.inProgress).toBe(false);
  });

  test('step() does nothing when not inProgress', () => {
    const update = jest.fn();
    t.updateFunction = update;
    t.step(500);
    expect(update).not.toHaveBeenCalled();
  });

  test('step() calls updateFunction with interpolated value', () => {
    const update = jest.fn();
    const stop = jest.fn();
    t.start(0, update, stop, 0, 100, 1000);
    t.step(500); // halfway
    expect(update).toHaveBeenCalledWith(50);
  });

  test('step() calls stopFunction when elapsed >= duration', () => {
    const update = jest.fn();
    const stop = jest.fn();
    t.start(0, update, stop, 0, 100, 1000);
    t.step(1001); // past duration
    expect(stop).toHaveBeenCalled();
    expect(t.inProgress).toBe(false);
  });

  test('step() decrements count if count > 0', () => {
    const update = jest.fn();
    t.start(0, update, null, 0, 100, 1000);
    t.count = 2;
    t.step(500);
    expect(t.count).toBe(1);
    expect(update).not.toHaveBeenCalled();
  });

  test('restart() re-starts with new values and steps', () => {
    const update = jest.fn();
    const stop = jest.fn();
    t.start(0, update, stop, 0, 100, 1000);
    t.restart(0, 50, 200);
    expect(t.startValue).toBe(50);
    expect(t.endValue).toBe(200);
    expect(t.inProgress).toBe(true);
  });
});
