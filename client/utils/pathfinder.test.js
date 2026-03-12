import Pathfinder from './pathfinder';

jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Pathfinder', () => {
  let pf;
  const width = 5;
  const height = 5;

  beforeEach(() => {
    pf = new Pathfinder(width, height);
  });

  test('constructor builds a blank grid', () => {
    expect(pf.blankGrid.length).toBe(height);
    expect(pf.blankGrid[0].length).toBe(width);
    expect(pf.blankGrid[0][0]).toBe(0);
  });

  test('find() returns a path on open grid', () => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    const entity = { gridX: 0, gridY: 0 };
    const path = pf.find(grid, entity, 4, 4, false);
    expect(Array.isArray(path)).toBe(true);
    expect(path.length).toBeGreaterThan(0);
  });

  test('find() returns empty path when blocked', () => {
    // Block entire column 1 so no path from (0,0) to (4,0)
    const grid = [
      [0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
    ];
    const entity = { gridX: 0, gridY: 0 };
    const path = pf.find(grid, entity, 4, 0, false);
    expect(path).toEqual([]);
  });

  test('ignoreEntity() adds entity to ignores list', () => {
    const entity = { gridX: 1, gridY: 1 };
    pf.ignoreEntity(entity);
    expect(pf.ignores).toContain(entity);
  });

  test('ignoreEntity() does nothing for null', () => {
    pf.ignoreEntity(null);
    expect(pf.ignores.length).toBe(0);
  });

  test('clearIgnores() empties the ignores list', () => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    pf.grid = grid;
    const entity = { gridX: 1, gridY: 1, hasPath: () => false };
    pf.ignoreEntity(entity);
    pf.clearIgnores();
    expect(pf.ignores).toEqual([]);
  });
});
