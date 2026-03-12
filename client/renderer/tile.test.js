import Tile from './tile';

describe('Tile', () => {
  let tile;

  beforeEach(() => {
    tile = new Tile(10, 5, 4, 200);
  });

  test('constructor sets properties', () => {
    expect(tile.initialId).toBe(10);
    expect(tile.id).toBe(10);
    expect(tile.index).toBe(5);
    expect(tile.length).toBe(4);
    expect(tile.speed).toBe(200);
    expect(tile.lastTime).toBe(0);
    expect(tile.loaded).toBe(false);
  });

  test('setPosition() stores x and y', () => {
    tile.setPosition({ x: 3, y: 7 });
    expect(tile.x).toBe(3);
    expect(tile.y).toBe(7);
  });

  test('tick() advances id within sequence', () => {
    tile.tick();
    expect(tile.id).toBe(11);
  });

  test('tick() wraps id back to initialId after sequence', () => {
    tile.id = 13; // initialId=10, length=4, so 13-10=3 which is length-1
    tile.tick();
    expect(tile.id).toBe(tile.initialId);
  });

  test('animate() returns false if time has not elapsed', () => {
    tile.lastTime = 1000;
    expect(tile.animate(1050)).toBe(false);
  });

  test('animate() returns true and advances tile when time elapsed', () => {
    tile.lastTime = 0;
    expect(tile.animate(300)).toBe(true);
    expect(tile.lastTime).toBe(300);
  });

  test('getPosition() returns [-1,-1] when position not set', () => {
    expect(tile.getPosition()).toEqual([-1, -1]);
  });

  test('getPosition() returns [x,y] when position is set', () => {
    tile.setPosition({ x: 2, y: 4 });
    expect(tile.getPosition()).toEqual([2, 4]);
  });
});
