import _ from 'underscore';
import log from '../lib/log';

/**
 * Manages all spatial grids used for rendering, pathing, entities and items
 * @class
 */
export default class Grids {
  /**
   * Default constructor
   * @param {Map} map an instance of the game map
   */
  constructor(map) {
    /**
     * Reference to the game map
     * @type {Map}
     */
    this.map = map;

    /**
     * Grid tracking which entities should be rendered at each position
     * @type {Array}
     */
    this.renderingGrid = [];
    /**
     * Grid used by the pathfinding algorithm to determine walkability
     * @type {Array}
     */
    this.pathingGrid = [];
    /**
     * Grid tracking which entities occupy each position
     * @type {Array}
     */
    this.entityGrid = [];
    /**
     * Grid tracking which items are placed at each position
     * @type {Array}
     */
    this.itemGrid = [];

    this.loadGrids();
  }

  /**
   * Initialises all grids to their default empty or map-derived values
   */
  loadGrids() {
    for (let i = 0; i < this.map.height; i += 1) {
      this.renderingGrid[i] = [];
      this.pathingGrid[i] = [];
      this.entityGrid[i] = [];
      this.itemGrid[i] = [];

      for (let j = 0; j < this.map.width; j += 1) {
        this.renderingGrid[i][j] = {};
        this.pathingGrid[i][j] = this.map.grid[i][j];
        this.entityGrid[i][j] = {};
        this.itemGrid[i][j] = {};
      }
    }

    log.debug('Finished loading preliminary grids.');
  }

  /**
   * Removes walkable cells from the pathing grid within a radius around the player
   * @param {Entity} player the player entity used as the centre of the search radius
   * @param {Number} xRadius the horizontal tile radius to check
   * @param {Number} yRadius the vertical tile radius to check
   */
  checkPathingGrid(player, xRadius, yRadius) {
    // mobile 1 = 15 * 8
    // desktop 2 = 30 x 16

    for (let y = player.gridY - yRadius; y < player.gridY + yRadius; y += 1) {
      for (let x = player.gridX - xRadius; x < player.gridX + xRadius; x += 1) {
        if (
          !this.map.isColliding(x, y)
          && _.size(this.entityGrid[y][x] === 0)
        ) this.removeFromPathingGrid(x, y);
      }
    }
  }

  /**
   * Resets the pathing grid to the base collision values from the map
   */
  resetPathingGrid() {
    this.pathingGrid = [];

    for (let i = 0; i < this.map.height; i += 1) {
      this.pathingGrid[i] = [];

      for (let j = 0; j < this.map.width; j += 1) this.pathingGrid[i][j] = this.map.grid[i][j];
    }
  }

  /**
   * Adds an entity to the rendering grid at the specified position
   * @param {Entity} entity the entity to add
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  addToRenderingGrid(entity, x, y) {
    if (!this.map.isOutOfBounds(x, y)) this.renderingGrid[y][x][entity.id] = entity;
  }

  /**
   * Marks a grid cell as blocked in the pathing grid
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  addToPathingGrid(x, y) {
    this.pathingGrid[y][x] = 1;
  }

  /**
   * Adds an entity to the entity grid at the specified position
   * @param {Entity} entity the entity to add
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  addToEntityGrid(entity, x, y) {
    if (entity && this.entityGrid[y][x]) this.entityGrid[y][x][entity.id] = entity;
  }

  /**
   * Adds an item to the item grid at the specified position
   * @param {Item} item the item to add
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  addToItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x]) this.itemGrid[y][x][item.id] = item;
  }

  /**
   * Removes an entity from the rendering grid at the specified position
   * @param {Entity} entity the entity to remove
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  removeFromRenderingGrid(entity, x, y) {
    if (
      entity
      && this.renderingGrid[y][x]
      && entity.id in this.renderingGrid[y][x]
    ) delete this.renderingGrid[y][x][entity.id];
  }

  /**
   * Marks a grid cell as unblocked in the pathing grid
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  removeFromPathingGrid(x, y) {
    this.pathingGrid[y][x] = 0;
  }

  /**
   * Removes an entity from the entity grid at the specified position
   * @param {Entity} entity the entity to remove
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  removeFromEntityGrid(entity, x, y) {
    if (entity && this.entityGrid[y][x] && entity.id in this.entityGrid[y][x]) {
      delete this.entityGrid[y][x][entity.id];
    }
  }

  /**
   * Removes an item from the item grid at the specified position
   * @param {Item} item the item to remove
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  removeFromItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x][item.id]) delete this.itemGrid[y][x][item.id];
  }

  /**
   * Removes an entity from the entity, pathing and rendering grids at its current and next positions
   * @param {Entity} entity the entity to fully remove from all grids
   */
  removeEntity(entity) {
    if (entity) {
      this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
      this.removeFromPathingGrid(entity.gridX, entity.gridY);
      this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

      if (entity.nextGridX > -1 && entity.nextGridY > -1) {
        this.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
        this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
      }
    }
  }
}
