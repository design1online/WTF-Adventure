import Grids from './grids';

jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

function makeMap(width = 3, height = 3) {
  const grid = Array.from({ length: height }, () => Array(width).fill(0));
  return {
    width,
    height,
    grid,
    isOutOfBounds: jest.fn((x, y) => x < 0 || y < 0 || x >= width || y >= height),
    isColliding: jest.fn().mockReturnValue(false),
  };
}

describe('Grids', () => {
  let grids;
  let map;

  beforeEach(() => {
    map = makeMap(3, 3);
    grids = new Grids(map);
  });

  test('loadGrids() initializes all grids', () => {
    expect(grids.renderingGrid.length).toBe(3);
    expect(grids.pathingGrid.length).toBe(3);
    expect(grids.entityGrid.length).toBe(3);
    expect(grids.itemGrid.length).toBe(3);
  });

  test('addToRenderingGrid() adds entity to grid', () => {
    const entity = { id: 1 };
    grids.addToRenderingGrid(entity, 1, 1);
    expect(grids.renderingGrid[1][1][1]).toBe(entity);
  });

  test('addToRenderingGrid() ignores out-of-bounds', () => {
    const entity = { id: 2 };
    grids.addToRenderingGrid(entity, -1, -1);
    // no throw
  });

  test('addToPathingGrid() marks cell as 1', () => {
    grids.addToPathingGrid(1, 1);
    expect(grids.pathingGrid[1][1]).toBe(1);
  });

  test('addToEntityGrid() adds entity', () => {
    const entity = { id: 5 };
    grids.addToEntityGrid(entity, 2, 0);
    expect(grids.entityGrid[0][2][5]).toBe(entity);
  });

  test('addToItemGrid() adds item', () => {
    const item = { id: 10 };
    grids.addToItemGrid(item, 0, 2);
    expect(grids.itemGrid[2][0][10]).toBe(item);
  });

  test('removeFromRenderingGrid() removes entity', () => {
    const entity = { id: 1 };
    grids.addToRenderingGrid(entity, 1, 1);
    grids.removeFromRenderingGrid(entity, 1, 1);
    expect(grids.renderingGrid[1][1][1]).toBeUndefined();
  });

  test('removeFromPathingGrid() sets cell to 0', () => {
    grids.addToPathingGrid(2, 2);
    grids.removeFromPathingGrid(2, 2);
    expect(grids.pathingGrid[2][2]).toBe(0);
  });

  test('removeFromEntityGrid() removes entity', () => {
    const entity = { id: 3 };
    grids.addToEntityGrid(entity, 1, 0);
    grids.removeFromEntityGrid(entity, 1, 0);
    expect(grids.entityGrid[0][1][3]).toBeUndefined();
  });

  test('removeFromItemGrid() removes item', () => {
    const item = { id: 7 };
    grids.addToItemGrid(item, 0, 0);
    grids.removeFromItemGrid(item, 0, 0);
    expect(grids.itemGrid[0][0][7]).toBeUndefined();
  });

  test('resetPathingGrid() resets pathing grid', () => {
    grids.addToPathingGrid(1, 1);
    grids.resetPathingGrid();
    expect(grids.pathingGrid[1][1]).toBe(map.grid[1][1]);
  });

  test('removeEntity() removes entity from all grids', () => {
    const entity = { id: 9, gridX: 1, gridY: 1, nextGridX: -1, nextGridY: -1 };
    grids.addToEntityGrid(entity, 1, 1);
    grids.addToRenderingGrid(entity, 1, 1);
    grids.addToPathingGrid(1, 1);
    grids.removeEntity(entity);
    expect(grids.pathingGrid[1][1]).toBe(0);
  });
});
