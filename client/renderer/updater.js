import Modules from '../utils/modules';
import Character from '../entity/character/character';

export default class Updater {
  constructor(game) {
    this.game = game;
    this.camera = game.getCamera();
    this.renderer = game.renderer;
    this.input = game.input;
    this.sprites = null;
  }

  update() {
    this.timeDifferential = (new Date() - this.lastUpdate) / 1000;

    this.animateTiles();
    this.updateEntities();
    this.input.updateCursor();
    this.updateKeyboard();
    this.updateAnimations();
    this.verifyScale();
    this.updateInfos();
    this.updateBubbles();

    this.lastUpdate = new Date();
  }

  animateTiles() {
    const {
      time,
    } = this.game;

    this.renderer.forEachAnimatedTile((tile) => {
      if (tile.animate(time)) {
        tile.isDirty = true; // eslint-disable-line
        tile.dirtyRect = this.renderer.getTileBounds(tile); // eslint-disable-line
      }
    });
  }

  updateEntities() {
    this.game.entities.forEachEntity((entity) => {
      if (entity.spriteLoaded) {
        this.updateFading(entity);

        const animation = entity.currentAnimation;

        if (animation) animation.update(this.game.time);

        if (entity instanceof Character) {
          if (entity.critical && entity.criticalAnimation) {
            entity.criticalAnimation.update(this.game.time);
          }

          if (entity.terror && entity.terrorAnimation) {
            entity.terrorAnimation.update(this.game.time);
          }

          if (entity.stunned && entity.stunAnimation) {
            entity.stunAnimation.update(this.game.time);
          }

          if (entity.explosion && entity.explosionAnimation) {
            entity.explosionAnimation.update(this.game.time);
          }

          if (entity.movement && entity.movement.inProgress) {
            entity.movement.step(this.game.time);
          }

          if (entity.hasPath() && !entity.movement.inProgress) {
            const tick = Math.round(266 / entity.movementSpeed);

            switch (entity.orientation) {
              case Modules.Orientation.Left:
                entity.movement.start(
                  this.game.time,
                  (x) => {
                    entity.x = x; // eslint-disable-line
                    entity.moved();
                  },
                  () => {
                    entity.x = entity.movement.endValue; // eslint-disable-line
                    entity.moved();
                    entity.nextStep();
                  },
                  entity.x - tick,
                  entity.x - 16,
                  entity.movementSpeed,
                );

                break;

              case Modules.Orientation.Right:
                entity.movement.start(
                  this.game.time,
                  (x) => {
                    entity.x = x; // eslint-disable-line
                    entity.moved();
                  },
                  () => {
                    entity.x = entity.movement.endValue; // eslint-disable-line
                    entity.moved();
                    entity.nextStep();
                  },
                  entity.x + tick,
                  entity.x + 16,
                  entity.movementSpeed,
                );

                break;

              case Modules.Orientation.Up:
                entity.movement.start(
                  this.game.time,
                  (y) => {
                    entity.y = y; // eslint-disable-line
                    entity.moved();
                  },
                  () => {
                    entity.y = entity.movement.endValue; // eslint-disable-line
                    entity.moved();
                    entity.nextStep();
                  },
                  entity.y - tick,
                  entity.y - 16,
                  entity.movementSpeed,
                );

                break;

              case Modules.Orientation.Down:
                entity.movement.start(
                  this.game.time,
                  (y) => {
                    entity.y = y; // eslint-disable-line
                    entity.moved();
                  },
                  () => {
                    entity.y = entity.movement.endValue; // eslint-disable-line
                    entity.moved();
                    entity.nextStep();
                  },
                  entity.y + tick,
                  entity.y + 16,
                  entity.movementSpeed,
                );

                break;
              default:
                break;
            }
          }
        } else if (entity.type === 'projectile') {
          const mDistance = entity.speed * this.timeDifferential;
          const dx = entity.destX - entity.x;
          const dy = entity.destY - entity.y;
          const tDistance = Math.sqrt(dx * dx + dy * dy);
          let amount = mDistance / tDistance;

          if (amount > 1) {
            amount = 1;
          }

          entity.x += dx * amount; // eslint-disable-line
          entity.y += dy * amount; // eslint-disable-line

          if (tDistance < 5) entity.impact();
        }
      }
    });
  }

  updateFading(entity) {
    if (!entity || !entity.fading) {
      return;
    }

    const duration = 1000;
    const {
      time,
    } = this.game;
    const dt = time - entity.fadingTime;

    if (dt > duration) {
      entity.isFading = false; // eslint-disable-line
      entity.fadingAlpha = 1; // eslint-disable-line
    } else {
      entity.fadingAlpha = dt / duration; // eslint-disable-line
    }
  }

  updateKeyboard() {
    const {
      player,
    } = this.game;

    const position = {
      x: player.gridX,
      y: player.gridY,
    };

    if (player.frozen) {
      return;
    }

    if (player.moveUp) {
      position.y -= 1;
    } else if (player.moveDown) {
      position.y += 1;
    } else if (player.moveRight) {
      position.x += 1;
    } else if (player.moveLeft) {
      position.x -= 1;
    }

    if (player.hasKeyboardMovement()) {
      this.input.keyMove(position);
    }
  }

  updateAnimations() {
    const target = this.input.targetAnimation;

    // stops animation from updating on targetAnimation
    if (target && this.input.selectedCellVisible && !this.renderer.mobile) {
      target.update(this.game.time);
    }

    if (!this.sprites) {
      return;
    }

    const sparks = this.sprites.sparksAnimation;

    if (sparks) {
      sparks.update(this.game.time);
    }
  }

  verifyScale() {
    const scale = this.renderer.getDrawingScale();

    if (this.renderer.tileset && this.renderer.tileset.scale !== scale) {
      this.game.map.updateTileset();
    }
  }

  updateInfos() {
    if (this.game.info) {
      this.game.info.update(this.game.time);
    }
  }

  updateBubbles() {
    if (this.game.bubble) {
      this.game.bubble.update(this.game.time);
    }

    if (this.game.pointer) {
      this.game.pointer.update();
    }
  }

  setSprites(sprites) {
    this.sprites = sprites;
  }
}
