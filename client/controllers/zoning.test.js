import Zone from './zoning';
import { Modules } from '../utils/modules';

describe('Zone', () => {
  let zone;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      renderer: {},
      camera: {},
      input: {},
    };
    zone = new Zone(mockGame);
  });

  test('constructor sets game, renderer, camera, input', () => {
    expect(zone.game).toBe(mockGame);
    expect(zone.renderer).toBe(mockGame.renderer);
    expect(zone.camera).toBe(mockGame.camera);
    expect(zone.input).toBe(mockGame.input);
    expect(zone.direction).toBeNull();
  });

  test('reset() clears direction', () => {
    zone.direction = Modules.Orientation.Up;
    zone.reset();
    expect(zone.direction).toBeNull();
  });

  test('setUp() sets direction to Up', () => {
    zone.setUp();
    expect(zone.direction).toBe(Modules.Orientation.Up);
  });

  test('setDown() sets direction to Down', () => {
    zone.setDown();
    expect(zone.direction).toBe(Modules.Orientation.Down);
  });

  test('setRight() sets direction to Right', () => {
    zone.setRight();
    expect(zone.direction).toBe(Modules.Orientation.Right);
  });

  test('setLeft() sets direction to Left', () => {
    zone.setLeft();
    expect(zone.direction).toBe(Modules.Orientation.Left);
  });

  test('getDirection() returns current direction', () => {
    zone.setUp();
    expect(zone.getDirection()).toBe(Modules.Orientation.Up);
  });
});
