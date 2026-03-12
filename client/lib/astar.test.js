import AStar from './astar';

describe('AStar', () => {
  test('is a function', () => {
    expect(typeof AStar).toBe('function');
  });

  test('finds a simple straight path', () => {
    // 5x5 all-zeros grid (no collisions)
    const grid = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
    const path = AStar(grid, [0, 0], [4, 0]);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([4, 0]);
  });

  test('returns empty array when path is blocked', () => {
    // 3x3 with middle column blocked
    const grid = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ];
    const path = AStar(grid, [0, 0], [2, 0]);
    expect(path).toEqual([]);
  });

  test('finds a diagonal path with DiagonalFree', () => {
    const grid = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const path = AStar(grid, [0, 0], [2, 2], 'DiagonalFree');
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual([2, 2]);
  });

  test('returns start == end as single point', () => {
    const grid = [[0, 0], [0, 0]];
    const path = AStar(grid, [0, 0], [0, 0]);
    expect(path[0]).toEqual([0, 0]);
  });
});
