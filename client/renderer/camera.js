import Modules from '../utils/modules';

export default class Camera {
  constructor(renderer) {
    this.renderer = renderer;

    this.offset = 0.5;
    this.x = 0;
    this.y = 0;

    this.dX = 0;
    this.dY = 0;

    this.gridX = 0;
    this.gridY = 0;

    this.prevGridX = 0;
    this.prevGridY = 0;

    this.speed = 1;
    this.panning = false;
    this.centered = true;
    this.player = null;

    this.update();
  }

  update() {
    const factor = this.renderer.getUpscale();

    this.gridWidth = 15 * factor;
    this.gridHeight = 8 * factor;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    this.prevGridX = this.gridX;
    this.prevGridY = this.gridY;

    this.gridX = Math.floor(x / 16);
    this.gridY = Math.floor(y / 16);
  }

  clip() {
    this.setGridPosition(Math.round(this.x / 16), Math.round(this.y / 16));
  }

  center() {
    if (this.centered) {
      return;
    }

    this.centered = true;
    this.centreOn(this.player);

    this.renderer.verifyCentration();
  }

  decenter() {
    if (!this.centered) {
      return;
    }

    this.clip();
    this.centered = false;

    this.renderer.verifyCentration();
  }

  setGridPosition(x, y) {
    this.prevGridX = this.gridX;
    this.prevGridY = this.gridY;

    this.gridX = x;
    this.gridY = y;

    this.x = this.gridX * 16;
    this.y = this.gridY * 16;
  }

  setPlayer(player) {
    this.player = player;

    this.centreOn(this.player);
  }

  handlePanning(direction) {
    if (!this.panning) {
      return;
    }

    switch (direction) {
      default:
        break;
      case Modules.Keys.Up:
        this.setPosition(this.x, this.y - 1);
        break;

      case Modules.Keys.Down:
        this.setPosition(this.x, this.y + 1);
        break;

      case Modules.Keys.Left:
        this.setPosition(this.x - 1, this.y);
        break;

      case Modules.Keys.Right:
        this.setPosition(this.x + 1, this.y);
        break;
    }
  }

  centreOn(entity) {
    if (!entity) {
      return;
    }

    const width = Math.floor(this.gridWidth / 2);
    const height = Math.floor(this.gridHeight / 2);

    this.x = entity.x - width * this.renderer.tileSize;
    this.y = entity.y - height * this.renderer.tileSize;

    this.gridX = Math.round(entity.x / 16) - width;
    this.gridY = Math.round(entity.y / 16) - height;
  }

  zone(direction) {
    switch (direction) {
      default:
        break;
      case Modules.Orientation.Up:
        this.setGridPosition(this.gridX, this.gridY - this.gridHeight + 2);
        break;

      case Modules.Orientation.Down:
        this.setGridPosition(this.gridX, this.gridY + this.gridHeight - 2);
        break;

      case Modules.Orientation.Right:
        this.setGridPosition(this.gridX + this.gridWidth - 2, this.gridY);
        break;

      case Modules.Orientation.Left:
        this.setGridPosition(this.gridX - this.gridWidth + 2, this.gridY);
        break;
    }
  }

  forEachVisiblePosition(callback, offset) {
    if (!offset) {
      offset = 1; // eslint-disable-line
    }

    for (let y = this.gridY - offset, maxY = y + this.gridHeight + offset * 2; y < maxY; y += 1) {
      for (let x = this.gridX - offset, maxX = x + this.gridWidth + offset * 2; x < maxX; x += 1) {
        callback(x, y);
      }
    }
  }
}
