import Packets from '../../../network/packets';

/**
 * This is a player handler, responsible for all the {@link Player} callbacks
 * without having to clutter up the entire file.
 * @class
 */
export default class PlayerHandler {
  /**
   * Default constructor
   * @param {Game} game instance of the game
   * @param {Player} player instance of the player
   */
  constructor(game, player) {
    /**
     * Instance of the game
     * @type {Game}
     */
    this.game = game;

    /**
     * Reference to the game Camera
     * @type {Camera}
     */
    this.camera = game.getCamera();

    /**
     * Reference to input in the game
     * @type {Input}
     */
    this.input = game.input;

    /**
     * Reference to the player
     * @type {Player}
     */
    this.player = player;

    /**
     * Entities in the game
     * @type {Entities}
     */
    this.entities = game.entities;

    /**
     * Reference to the server Socket
     * @type {Socket}
     */
    this.socket = game.socket;

    /**
     * Reference to the render layers
     * @type {Renderer}
     */
    this.renderer = game.renderer;

    // load the player handler
    this.loadPlayerHandler();
  }

  /**
   * Load the the callbacks for the player
   */
  loadPlayerHandler() {
    this.player.onRequestPath((x, y) => {
      if (this.player.dead) {
        return null;
      }

      const ignores = [this.player];

      if (this.player.hasTarget()) {
        ignores.push(this.player.target);
      }

      this.socket.send(Packets.Movement, [
        Packets.MovementOpcode.Request,
        x,
        y,
        this.player.gridX,
        this.player.gridY,
      ]);

      return this.game.findPath(this.player, x, y, ignores);
    });

    this.player.onStartPathing((path) => {
      const i = path.length - 1;

      this.input.selectedX = path[i][0]; // eslint-disable-line
      this.input.selectedY = path[i][1]; // eslint-disable-line
      this.input.selectedCellVisible = true;

      if (!this.game.getEntityAt(this.input.selectedX, this.input.selectedY)) {
        console.log('canvas setting target no entity');
        this.socket.send(Packets.Target, [Packets.TargetOpcode.None]);
      }

      this.socket.send(Packets.Movement, [
        Packets.MovementOpcode.Started,
        this.input.selectedX,
        this.input.selectedY,
        this.player.gridX,
        this.player.gridY,
      ]);
    });

    this.player.onStopPathing((x, y) => {
      this.entities.unregisterPosition(this.player);
      this.entities.registerPosition(this.player);

      this.input.selectedCellVisible = false;

      this.camera.clip();

      const entity = this.game.getEntityAt(x, y, true);

      const hasTarget = this.player.hasTarget();

      const id = (entity && entity.id) || null;

      this.socket.send(Packets.Movement, [
        Packets.MovementOpcode.Stop,
        x,
        y,
        id,
        hasTarget,
      ]);

      if (hasTarget) {
        console.log('canvas stop pathing has target', hasTarget, this.player.target.id);
        this.socket.send(Packets.Target, [
          this.isAttackable()
            ? Packets.TargetOpcode.Attack
            : Packets.TargetOpcode.Talk,
          this.player.target.id,
        ]);

        this.player.lookAt(this.player.target);
      }

      this.input.setPassiveTarget();
    });

    this.player.onBeforeStep(() => {
      this.entities.unregisterPosition(this.player);

      if (!this.isAttackable()) {
        return;
      }

      if (this.player.isRanged()) {
        if (this.player.getDistance(this.player.target) < 7) {
          this.player.stop();
        }
      } else {
        this.input.selectedX = this.player.target.gridX;
        this.input.selectedY = this.player.target.gridY;
      }
    });

    this.player.onStep(() => {
      if (this.player.hasNextStep()) {
        this.entities.registerDuality(this.player);
      }

      if (!this.camera.centered) {
        this.checkBounds();
      }

      this.player.forEachAttacker((attacker) => {
        if (!attacker.stunned) attacker.follow(this.player);
      });

      this.socket.send(Packets.Movement, [
        Packets.MovementOpcode.Step,
        this.player.gridX,
        this.player.gridY,
      ]);
    });

    this.player.onSecondStep(() => {
      this.renderer.updateAnimatedTiles();
    });

    /**
     * This is a callback representing the absolute exact position of the player.
     */
    this.player.onMove(() => {
      if (this.camera.centered) {
        this.camera.centreOn(this.player);
      }

      if (this.player.hasTarget()) {
        this.player.follow(this.player.target);
      }
    });

    this.player.onUpdateArmour((armourName) => {
      this.player.setSprite(this.game.getSprite(armourName));
    });
  }

  /**
   * Whether or not this player can be attacked
   * @return {Boolean} returns true if it can be attacked
   */
  isAttackable() {
    const { target } = this.player;

    if (!target) {
      return false;
    }

    return target.type === 'mob' || (target.type === 'player' && target.pvp);
  }

  /**
   * Check the bounds of the player when they're not centered
   */
  checkBounds() {
    // get the X and Y position on the grid relative to
    // the player and the camera coordinates to check for
    // zoning directions
    const x = this.player.gridX - this.camera.gridX;
    const y = this.player.gridY - this.camera.gridY;

    if (x === 0) {
      this.game.zoning.setLeft();
    } else if (y === 0) {
      this.game.zoning.setUp();
    } else if (x === this.camera.gridWidth - 1) {
      this.game.zoning.setRight();
    } else if (y === this.camera.gridHeight - 1) {
      this.game.zoning.setDown();
    }

    // if the game is zoning to a direction update
    // the camera to the zone direction
    if (this.game.zoning.direction !== null) {
      this.camera.zone(this.game.zoning.getDirection());
      this.game.zoning.reset();
    }
  }
}
