import _ from 'underscore';

/**
 * This class is another version of the grid generation
 * system in the client side. It's used to simplify location
 * of all the entities in the world.
 * @class
 */
export default class Grids {
  /**
   * Default constructor
   * @param {Object} map the map instance used to determine grid dimensions
   */
  constructor(map) {
    /**
     * The map instance providing width and height dimensions
     * @type {Object}
     */
    this.map = map;

    /**
     * 2D grid array used to track entity positions by tile coordinate
     * @type {Array}
     */
    this.entityGrid = [];

    this.loadGrid();
  }

  /**
   * Initializes the entity grid with empty objects for each tile position
   */
  loadGrid() {
    for (let i = 0; i < this.map.height; i += 1) {
      this.entityGrid[i] = [];

      for (let j = 0; j < this.map.width; j += 1) this.entityGrid[i][j] = {};
    }
  }

  /**
   * Updates an entity's position in the grid from its old coordinates to its current coordinates
   * @param {Object} entity the entity whose position should be updated
   */
  updateEntityPosition(entity) {
    if (entity && entity.oldX === entity.x && entity.oldY === entity.y) return;

    this.removeFromEntityGrid(entity, entity.oldX, entity.oldY);
    this.addToEntityGrid(entity, entity.x, entity.y);

    entity.updatePosition();
  }

  /**
   * Adds an entity to the grid at the specified coordinates
   * @param {Object} entity the entity to add
   * @param {Number} x the x-coordinate in the grid
   * @param {Number} y the y-coordinate in the grid
   */
  addToEntityGrid(entity, x, y) {
    if (
      entity
      && x > 0
      && y > 0
      && x < this.map.width
      && x < this.map.height
      && this.entityGrid[y][x]
    ) this.entityGrid[y][x][entity.instance] = entity;
  }

  /**
   * Removes an entity from the grid at the specified coordinates
   * @param {Object} entity the entity to remove
   * @param {Number} x the x-coordinate in the grid
   * @param {Number} y the y-coordinate in the grid
   */
  removeFromEntityGrid(entity, x, y) {
    if (
      entity
      && x > 0
      && y > 0
      && x < this.map.width
      && y < this.map.height
      && this.entityGrid[y][x]
      && entity.instance in this.entityGrid[y][x]
    ) delete this.entityGrid[y][x][entity.instance];
  }

  /**
   * Returns all entities within a given radius of the specified entity
   * @param {Object} entity the center entity to search around
   * @param {Number} radius the radius in tiles to search within
   * @param {Boolean} include whether to include the center entity itself
   * @return {Array}
   */
  getSurroundingEntities(entity, radius, include) {
    const entities = [];

    if (!this.checkBounds(entity.x, entity.y, radius)) {
      return [];
    }

    for (let i = -radius; i < radius + 1; i += 1) {
      for (let j = -radius; j < radius + 1; j += 1) {
        const pos = this.entityGrid[entity.y + i][entity.x + j];

        if (_.size(pos) > 0) {
          _.each(pos, (pEntity) => {
            if (!include && pEntity.instance !== entity.instance) {
              entities.push(pEntity);
            }
          });
        }
      }
    }

    return entities;
  }

  /**
   * Checks whether a position with a given radius is within the map bounds
   * @param {Number} x the x-coordinate to check
   * @param {Number} y the y-coordinate to check
   * @param {Number} radius the radius to account for
   * @return {Boolean}
   */
  checkBounds(x, y, radius) {
    return (
      x + radius < this.map.width
      && x - radius > 0
      && y + radius < this.map.height
      && y - radius > 0
    );
  }
}
