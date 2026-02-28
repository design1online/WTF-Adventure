import _ from 'underscore';
import log from '../lib/log';
import AStar from '../lib/astar';

/**
 * Handles pathfinding for entities on the game grid
 * @class
 */
export default class Pathfinder {
  /**
   * Default constructor
   * @param {Number} width the width of the pathfinding grid in tiles
   * @param {Number} height the height of the pathfinding grid in tiles
   */
  constructor(width, height) {


    /**
     * The width of the grid in tiles
     * @type {Number}
     */
    this.width = width;
    /**
     * The height of the grid in tiles
     * @type {Number}
     */
    this.height = height;

    /**
     * The current active pathfinding grid
     * @type {Array}
     */
    this.grid = null;
    /**
     * A blank (all-passable) copy of the grid used for incomplete path searches
     * @type {Array}
     */
    this.blankGrid = [];
    /**
     * Entities to ignore when calculating collision during pathfinding
     * @type {Array}
     */
    this.ignores = [];

    this.loadPathfinder();
  }

  /**
   * Initializes the blank grid with zeroed rows and columns
   */
  loadPathfinder() {

    for (let i = 0; i < this.height; i += 1) {
      this.blankGrid[i] = [];

      for (let j = 0; j < this.width; j += 1) this.blankGrid[i][j] = 0;
    }

    log.debug('Sucessfully loaded the pathfinder!');
  }

  /**
   * Finds a path from an entity's current position to the given target coordinates
   * @param {Array} grid the current collision grid
   * @param {Object} entity the entity to path from
   * @param {Number} x the target x grid coordinate
   * @param {Number} y the target y grid coordinate
   * @param {Boolean} incomplete whether to attempt an incomplete path if no full path is found
   * @return {Array}
   */
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

  /**
   * Finds the closest reachable position along the ideal path when a full path is not available
   * @param {Array} start the starting grid coordinates
   * @param {Array} end the target grid coordinates
   * @return {Array}
   */
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

  /**
   * Sets ignored entities as passable or impassable on the current grid
   * @param {Boolean} ignored whether to mark ignored entities as passable (true) or impassable (false)
   */
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

  /**
   * Adds an entity to the ignore list so it is treated as passable during pathfinding
   * @param {Object} entity the entity to ignore
   */
  ignoreEntity(entity) {


    if (!entity) {
      return;
    }

    this.ignores.push(entity);
  }

  /**
   * Clears all ignored entities and restores their grid positions to impassable
   */
  clearIgnores() {


    this.applyIgnore(false);
    this.ignores = [];
  }
}
