import Entity from './entity';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock Packets used in EntityHandler
jest.mock('./network/packets', () => ({
  Movement: 9,
  MovementOpcode: { Entity: 6 },
}), { virtual: true });

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity(1, 'player', 'Hero');
  });

  test('constructor sets id, name, label', () => {
    expect(entity.id).toBe(1);
    expect(entity.name).toBe('player');
    expect(entity.label).toBe('Hero');
  });

  test('constructor initializes position to 0,0', () => {
    expect(entity.x).toBe(0);
    expect(entity.y).toBe(0);
    expect(entity.gridX).toBe(0);
    expect(entity.gridY).toBe(0);
  });

  test('constructor sets visible to true', () => {
    expect(entity.visible).toBe(true);
  });

  test('setPosition() updates x and y', () => {
    entity.setPosition(100, 200);
    expect(entity.x).toBe(100);
    expect(entity.y).toBe(200);
  });

  test('setGridPosition() updates grid and pixel positions', () => {
    entity.setGridPosition(3, 5);
    expect(entity.gridX).toBe(3);
    expect(entity.gridY).toBe(5);
    expect(entity.x).toBe(48);
    expect(entity.y).toBe(80);
  });

  test('setName() updates name', () => {
    entity.setName('Wizard');
    expect(entity.name).toBe('Wizard');
  });

  test('setVisible() / isVisible() / toggleVisibility()', () => {
    entity.setVisible(false);
    expect(entity.isVisible()).toBe(false);
    entity.toggleVisibility();
    expect(entity.isVisible()).toBe(true);
  });

  test('hasShadow() returns shadow property', () => {
    expect(entity.hasShadow()).toBe(false);
    entity.shadow = true;
    expect(entity.hasShadow()).toBe(true);
  });

  test('hasPath() returns path property', () => {
    expect(entity.hasPath()).toBe(false);
    entity.path = [[1, 2]];
    expect(entity.hasPath()).toBeTruthy();
  });

  test('fadeIn() sets fading and fadingTime', () => {
    entity.fadeIn(300);
    expect(entity.fading).toBe(true);
    expect(entity.fadingTime).toBe(300);
  });

  test('blink() starts blinking interval', () => {
    jest.useFakeTimers();
    entity.blink(200);
    expect(entity.blinking).not.toBeNull();
    clearInterval(entity.blinking);
    jest.useRealTimers();
  });

  test('stopBlinking() clears interval and sets visible', () => {
    jest.useFakeTimers();
    entity.blink(200);
    entity.setVisible(false);
    entity.stopBlinking();
    expect(entity.visible).toBe(true);
    jest.useRealTimers();
  });

  test('isPositionAdjacent() detects north', () => {
    entity.gridX = 5;
    entity.gridY = 5;
    expect(entity.isPositionAdjacent(5, 6)).toBe(true);
  });

  test('isPositionAdjacent() returns false for non-adjacent', () => {
    entity.gridX = 5;
    entity.gridY = 5;
    expect(entity.isPositionAdjacent(10, 10)).toBe(false);
  });

  test('getDistance() returns max of x/y distance', () => {
    entity.gridX = 0;
    entity.gridY = 0;
    const other = { gridX: 3, gridY: 1 };
    expect(entity.getDistance(other)).toBe(3);
  });

  test('getCoordDistance() returns max of x/y to coords', () => {
    entity.gridX = 0;
    entity.gridY = 0;
    expect(entity.getCoordDistance(2, 5)).toBe(5);
  });

  test('setCountdown() sets counter properties', () => {
    entity.setCountdown(10);
    expect(entity.counter).toBe(10);
    expect(entity.hasCounter).toBe(true);
  });

  test('onReady() and readyCallback are set', () => {
    const cb = jest.fn();
    entity.onReady(cb);
    expect(entity.readyCallback).toBe(cb);
  });

  test('onDirty() sets dirtyCallback', () => {
    const cb = jest.fn();
    entity.onDirty(cb);
    expect(entity.dirtyCallback).toBe(cb);
  });

  test('loadDirty() marks entity as dirty', () => {
    expect(entity.dirty).toBe(true);
  });
});
