/* global log, Packets, Modules */

define(function() {
  /**
   * This is a player handler, responsible for all the callbacks
   * without having to clutter up the entire game file.
   */

  return Class.extend({
    init(game, player) {
      var self = this;

      this.game = game;
      this.camera = game.getCamera();
      this.input = game.input;
      this.player = player;
      this.entities = game.entities;
      this.socket = game.socket;
      this.renderer = game.renderer;

      this.load();
    },

    load() {
      var self = this;

      this.player.onRequestPath(function(x, y) {
        if (this.player.dead) return null;

        var ignores = [this.player];

        if (this.player.hasTarget()) ignores.push(this.player.target);

        this.socket.send(Packets.Movement, [
          Packets.MovementOpcode.Request,
          x,
          y,
          this.player.gridX,
          this.player.gridY
        ]);

        return this.game.findPath(this.player, x, y, ignores);
      });

      this.player.onStartPathing(function(path) {
        var i = path.length - 1;

        this.input.selectedX = path[i][0];
        this.input.selectedY = path[i][1];
        this.input.selectedCellVisible = true;

        if (!this.game.getEntityAt(this.input.selectedX, this.input.selectedY))
          this.socket.send(Packets.Target, [Packets.TargetOpcode.None]);

        this.socket.send(Packets.Movement, [
          Packets.MovementOpcode.Started,
          this.input.selectedX,
          this.input.selectedY,
          this.player.gridX,
          this.player.gridY
        ]);
      });

      this.player.onStopPathing(function(x, y) {
        this.entities.unregisterPosition(this.player);
        this.entities.registerPosition(this.player);

        this.input.selectedCellVisible = false;

        this.camera.clip();

        var id = null,
          entity = this.game.getEntityAt(x, y, true);

        if (entity) id = entity.id;

        var hasTarget = this.player.hasTarget();

        this.socket.send(Packets.Movement, [
          Packets.MovementOpcode.Stop,
          x,
          y,
          id,
          hasTarget
        ]);

        if (hasTarget) {
          this.socket.send(Packets.Target, [
            this.isAttackable()
              ? Packets.TargetOpcode.Attack
              : Packets.TargetOpcode.Talk,
            this.player.target.id
          ]);

          this.player.lookAt(this.player.target);
        }

        this.input.setPassiveTarget();
      });

      this.player.onBeforeStep(function() {
        this.entities.unregisterPosition(this.player);

        if (!this.isAttackable()) return;

        if (this.player.isRanged()) {
          if (this.player.getDistance(this.player.target) < 7)
            this.player.stop();
        } else {
          this.input.selectedX = this.player.target.gridX;
          this.input.selectedY = this.player.target.gridY;
        }
      });

      this.player.onStep(function() {
        if (this.player.hasNextStep())
          this.entities.registerDuality(this.player);

        if (!this.camera.centered) this.checkBounds();

        this.player.forEachAttacker(function(attacker) {
          if (!attacker.stunned) attacker.follow(this.player);
        });

        this.socket.send(Packets.Movement, [
          Packets.MovementOpcode.Step,
          this.player.gridX,
          this.player.gridY
        ]);
      });

      this.player.onSecondStep(function() {
        this.renderer.updateAnimatedTiles();
      });

      this.player.onMove(function() {
        /**
         * This is a callback representing the absolute exact position of the player.
         */

        if (this.camera.centered) this.camera.centreOn(this.player);

        if (this.player.hasTarget()) this.player.follow(this.player.target);
      });

      this.player.onUpdateArmour(function(armourName) {
        this.player.setSprite(this.game.getSprite(armourName));
      });
    },

    isAttackable() {
      var self = this,
        target = this.player.target;

      if (!target) return;

      return target.type === "mob" || (target.type === "player" && target.pvp);
    },

    checkBounds() {
      var self = this,
        x = this.player.gridX - this.camera.gridX,
        y = this.player.gridY - this.camera.gridY,
        isBorder = false;

      if (x === 0) this.game.zoning.setLeft();
      else if (y === 0) this.game.zoning.setUp();
      else if (x === this.camera.gridWidth - 1) this.game.zoning.setRight();
      else if (y === this.camera.gridHeight - 1) this.game.zoning.setDown();

      if (this.game.zoning.direction !== null) {
        this.camera.zone(this.game.zoning.getDirection());
        this.game.zoning.reset();
      }
    }
  });
});