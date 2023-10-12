import _ from 'underscore';
import log from '../lib/log';

export default class Grids {
  constructor(map) {
    this.map = map;

    this.renderingGrid = [];
    this.pathingGrid = [];
    this.entityGrid = [];
    this.itemGrid = [];

    this.loadGrids();
  }

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

  resetPathingGrid() {
    this.pathingGrid = [];

    for (let i = 0; i < this.map.height; i += 1) {
      this.pathingGrid[i] = [];

      for (let j = 0; j < this.map.width; j += 1) this.pathingGrid[i][j] = this.map.grid[i][j];
    }
  }

  addToRenderingGrid(entity, x, y) {
    if (!this.map.isOutOfBounds(x, y)) this.renderingGrid[y][x][entity.id] = entity;
  }

  addToPathingGrid(x, y) {
    this.pathingGrid[y][x] = 1;
  }

  addToEntityGrid(entity, x, y) {
    if (entity && this.entityGrid[y][x]) this.entityGrid[y][x][entity.id] = entity;
  }

  addToItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x]) this.itemGrid[y][x][item.id] = item;
  }

  removeFromRenderingGrid(entity, x, y) {
    if (
      entity
      && this.renderingGrid[y][x]
      && entity.id in this.renderingGrid[y][x]
    ) delete this.renderingGrid[y][x][entity.id];
  }

  removeFromPathingGrid(x, y) {
    this.pathingGrid[y][x] = 0;
  }

  removeFromEntityGrid(entity, x, y) {
    if (entity && this.entityGrid[y][x] && entity.id in this.entityGrid[y][x]) {
      delete this.entityGrid[y][x][entity.id];
    }
  }

  removeFromItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x][item.id]) delete this.itemGrid[y][x][item.id];
  }

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
