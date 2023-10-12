import _ from 'underscore';
import log from '../lib/log';
import AStar from '../lib/astar';

export default class Pathfinder {
  constructor(width, height) {
    

    this.width = width;
    this.height = height;

    this.grid = null;
    this.blankGrid = [];
    this.ignores = [];

    this.loadPathfinder();
  }

  loadPathfinder() {

    for (let i = 0; i < this.height; i += 1) {
      this.blankGrid[i] = [];

      for (let j = 0; j < this.width; j += 1) this.blankGrid[i][j] = 0;
    }

    log.debug('Sucessfully loaded the pathfinder!');
  }

  find(grid, entity, x, y, incomplete) {
    
    const start = [entity.gridX, entity.gridY];
    const end = [x, y];
    let path;

    this.grid = grid;
    this.applyIgnore(true);

    path = AStar(this.grid, start, end);

    if (path.length === 0 && incomplete) {
      path = this.findIncomplete(start, end);
    }

    return path;
  }

  findIncomplete(start, end) {
    
    let incomplete = [];
    let x;
    let y;

    const perfect = AStar(this.blankGrid, start, end);

    for (let i = perfect.length - 1; i > 0; i -= 1) {
      x = perfect[i][0]; // eslint-disable-line
      y = perfect[i][1]; // eslint-disable-line

      if (this.grid[y][x] === 0) {
        incomplete = AStar(this.grid, start, [x.y]);
        break;
      }
    }

    return incomplete;
  }

  applyIgnore(ignored) {
    
    let x;
    let y;

    _.each(this.ignores, (entity) => {
      x = entity.hasPath() ? entity.nextGridX : entity.gridX;
      y = entity.hasPath() ? entity.nextGridY : entity.gridY;

      if (x >= 0 && y >= 0) {
        this.grid[y][x] = ignored ? 0 : 1;
      }
    });
  }

  ignoreEntity(entity) {
    

    if (!entity) {
      return;
    }

    this.ignores.push(entity);
  }

  clearIgnores() {
    

    this.applyIgnore(false);
    this.ignores = [];
  }
}
