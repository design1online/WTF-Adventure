import _ from 'underscore';
import Player from '../entity/character/player/player';
import Sprites from './sprites';
import Item from '../entity/objects/item';
import log from '../lib/log';

/**
 * Used to load the character and items for the player
 * @class
 */
export default class PickCharacter {
  /**
   * Default constructor
   * @param {Game} game Reference to the game class
   */
  constructor(game) {
    /**
     * Instance of the game
     * @type {Game}
     */
    this.game = game;

    /**
     * Instance of the renderer
     * @type {Renderer}
     */
    this.renderer = game.renderer;

    /**
     * Grids
     * @type {[type]}
     */
    this.grids = null;

    /**
     * A reference to other game sprites in the game
     * @type {Sprites}
     */
    this.sprites = null;

    /**
     * A reference to the entities in the game
     * @type {Array}
     */
    this.entities = {};

    /**
     * @TODO not sure this is even used
     * @type {Object}
     */
    this.decrepit = {};
  }

  /**
   * Load the character into the game
   */
  loadCharacter() {
    log.debug('PickCharacter - loadCharacter()', this.sprites);
    this.game.client.sendStatus('Inviting craziness...');

    if (!this.sprites) {
      this.sprites = new Sprites(this.game.renderer);
    }

    this.game.client.sendStatus('Lots of spooky monsters...');
  }

  /**
   * Updating sprites in the game
   */
  update() {
    if (this.sprites) {
      this.sprites.updateSprites();
    }
  }

  /**
   * Create the player in the game
   */
  create() {
    const entity = new Player();

    entity.setGridPosition(0, 0);

    // set the default character sprite
    entity.setSprite(this.getSprite('clotharmor'));
    entity.idle();
    entity.loadHandler(this.game);
    this.addEntity(entity);
    entity.setGridPosition(0, 0);
    entity.idle();
    this.addEntity(entity);

    if (entity.handler) {
      entity.handler.setGame(this.game);
      entity.handler.loadEntity();
    }
  }

  /**
   * Return a specific entity by index
   * @param  {Number} id returns an entity with that ID
   * @return {Entity}
   */
  get(id) {
    if (id in this.entities) {
      return this.entities[id];
    }

    return null;
  }

  /**
   * Checks to see if an entity is there
   * @param  {Number} id The ID of the entity
   * @return {Entity
   */
  exists(id) {
    return id in this.entities;
  }

  /**
   * Clears the other players from the grid to calculate pathing
   * so they don't collide, then resets the players back into position
   * @param  {Player} exception Player to exlude when clearing
   */
  clearPlayers(exception) {
    _.each(this.entities, (entity) => {
      if (entity.id !== exception.id && entity.type === 'player') {
        this.grids.removeFromRenderingGrid(
          entity,
          entity.gridX,
          entity.gridY,
        );
        this.grids.removeFromPathingGrid(entity.gridX, entity.gridY);

        delete this.entities[entity.id];
      }
    });

    this.grids.resetPathingGrid();
  }

  /**
   * Adds an entity
   * @param {Entity} entity instance of the entity to add
   */
  addEntity(entity) {
    if (this.entities[entity.id]) {
      return;
    }

    this.entities[entity.id] = entity;
    this.registerPosition(entity);

    if (
      !(entity instanceof Item && entity.dropped)
      && !this.renderer.isPortableDevice()
    ) entity.fadeIn(this.game.time);
  }

  /**
   * Remove an item from the game
   * @param  {Item} item An instance of an item
   */
  removeItem(item) {
    if (!item) {
      return;
    }

    this.grids.removeFromItemGrid(item, item.gridX, item.gridY);
    this.grids.removeFromRenderingGrid(item, item.gridX, item.gridY);

    delete this.entities[item.id];
  }

  /**
   * Register the position of an entity and add it to the player's grid
   * @param  {Entity} entity An instance of a player, mob, npc or chest
   */
  registerPosition(entity) {
    log.debug('PickCharacter - registerPosition()', entity);

    if (!entity) {
      return;
    }

    if (
      entity.type === 'player'
      || entity.type === 'mob'
      || entity.type === 'npc'
      || entity.type === 'chest'
    ) {
      this.grids.addToEntityGrid(entity, entity.gridX, entity.gridY);

      if (entity.type !== 'player' || entity.nonPathable) {
        this.grids.addToPathingGrid(entity.gridX, entity.gridY);
      }
    }

    if (entity.type === 'item') {
      this.grids.addToItemGrid(entity, entity.gridX, entity.gridY);
    }

    this.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);
  }

  /**
   * Register position with duality (two things in the same spot) so
   * the entity is moved to a different spot
   * @param  {Entity} entity An instance of an entity
   */
  registerDuality(entity) {
    if (!entity) {
      return;
    }

    this.grids.entityGrid[entity.gridY][entity.gridX][entity.id] = entity;

    this.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);

    if (entity.nextGridX > -1 && entity.nextGridY > -1) {
      this.grids.entityGrid[entity.nextGridY][entity.nextGridX][
        entity.id
      ] = entity;

      if (!(entity instanceof Player)) {
        this.grids.pathingGrid[entity.nextGridY][entity.nextGridX] = 1;
      }
    }
  }

  /**
   * Remove an entity from a position on the grids
   * @param  {Entity} entity remove the entity from the grid
   */
  unregisterPosition(entity) {
    if (!entity) {
      return;
    }

    this.grids.removeEntity(entity);
  }

  /**
   * Get a sprite by name
   * @param  {String} name the name of the sprite
   * @return {Sprite} returns the sprite if found
   */
  getSprite(name) {
    return this.sprites.sprites[name];
  }

  /**
   * Returns all available entities
   * @return {Entity[]} array of entities
   */
  getAll() {
    return this.entities;
  }

  /**
   * Apply a callback function to every entity
   * @param  {Function} callback the function to apply to every entity
   */
  forEachEntity(callback) {
    _.each(this.entities, (entity) => {
      callback(entity);
    });
  }

  /**
   * Apply a callback function to entities within a position radius
   * @param  {Number}   x        X coordinate in the grid
   * @param  {Number}   y        Y coordinate in the grids
   * @param  {Number}   radius   How many grid spaces in the circle radius
   * @param  {Function} callback The callback function to apply
   */
  forEachEntityAround(x, y, radius, callback) {
    for (let i = x - radius, maxI = x + radius; i <= maxI; i += 1) {
      for (let j = y - radius, maxJ = y + radius; j <= maxJ; j += 1) {
        if (!this.map.isOutOfBounds(i, j)) {
          _.each(this.grids.renderingGrid[j][i], (entity) => {
            callback(entity);
          });
        }
      }
    }
  }
}
