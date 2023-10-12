import Packets from '../network/packets';
import log from '../lib/log';

/**
* This is a entity handler, responsible for all the {@link Entity} callbacks
* without having to clutter up the entire file.
* @class
*/
export default class EntityHandler {
  /**
   * Default constructor
   * @param {Entity} entity that will be handled
   */
  constructor(entity) {
    log.debug('Entity Handler - constructor()', entity);

    /**
     * Instance of the entity
     * @type {Entity}
     */
    this.entity = entity;

    /**
     * Instance of the game
     * @type {Game}
     */
    this.game = null;

    /**
     * An array of nearby entities
     * @type {Entities[]}
     */
    this.entities = null;
  }

  /**
   * Load the entity
   * @return {Boolean} false if no entity or game
   */
  load() {
    if (!this.entity || !this.game) {
      return false;
    }

    if (this.isCharacter()) {
      this.entity.onRequestPath((x, y) => {
        const ignored = [this.entity];

        return this.game.findPath(this.entity, x, y, ignored);
      });

      this.entity.onBeforeStep(() => {
        this.entities.unregisterPosition(this.entity);
      });

      this.entity.onStep(() => {
        this.entities.registerDuality(this.entity);

        this.entity.forEachAttacker((attacker) => {
          if (
            attacker.hasTarget()
            && attacker.target.id === this.entity.id
            && !attacker.stunned
          ) attacker.follow(this.entity);
        });

        if (this.entity.type === 'mob') {
          this.game.socket.send(Packets.Movement, [
            Packets.MovementOpcode.Entity,
            this.entity.id,
            this.entity.gridX,
            this.entity.gridY,
          ]);
        }

        if (
          this.entity.attackRange > 1
          && this.entity.hasTarget()
          && this.entity.getDistance(this.entity.target)
          <= this.entity.attackRange
        ) this.entity.stop(false);
      });

      this.entity.onStopPathing(() => {
        this.entities.grids.addToRenderingGrid(
          this.entity,
          this.entity.gridX,
          this.entity.gridY,
        );

        this.entities.unregisterPosition(this.entity);
        this.entities.registerPosition(this.entity);
      });
    }

    return true;
  }

  /**
   * Check if this is a character
   * @return {Boolean}
   */
  isCharacter() {
    return (
      this.entity.type
      && (this.entity.type === 'player'
        || this.entity.type === 'mob'
        || this.entity.type === 'npc')
    );
  }

  /**
   * Set the game instance
   * @param {Game} game instance of the game
   */
  setGame(game) {
    if (!this.game) {
      this.game = game;
    }

    this.setEntities(this.game.entities);
  }

  /**
   * Set the entities list
   * @param {Entities[]} entities array of Entity objects
   */
  setEntities(entities) {
    if (!this.entities) {
      this.entities = entities;
    }
  }
}