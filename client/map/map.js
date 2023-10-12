/* global Image, Worker */
import $ from 'jquery';
import _ from 'underscore';
import log from '../lib/log';
import {
  isInt,
} from '../utils/util';

export default class Map {
  constructor(game) {
    this.game = game;
    this.renderer = this.game.renderer;
    this.supportsWorker = this.game.client.hasWorker();
    this.data = [];
    this.tilesets = [];
    this.grid = null;
    this.tilesetsLoaded = false;
    this.mapLoaded = false;

    this.loadMap();
    this.loadTilesets();
    this.ready();
  }

  ready() {
    const rC = () => {
      if (this.readyCallback) {
        this.readyCallback();
      }
    };

    if (this.mapLoaded && this.tilesetsLoaded) {
      rC();
    } else {
      setTimeout(() => {
        this.ready();
      }, 50);
    }
  }

  loadMap() {
    if (this.supportsWorker) {
      log.debug('Map - loadMap() - Parsing map with Web Workers...');

      const worker = new Worker('./js/map/mapworker.js');
      worker.postMessage(1);

      worker.onmessage = (event) => {
        const map = event.data;

        this.parseMap(map);
        this.grid = map.grid;
        this.mapLoaded = true;
      };
    } else {
      log.debug('Map - loadMap() - Parsing map with Ajax...');

      $.get(
        '/data/maps/world_client.json',
        (data) => {
          this.parseMap(data);
          this.loadCollisions();
          this.mapLoaded = true;
        },
        'json',
      );
    }
  }

  /**
   * The tile-sheet of scale one is never used because
   * of its wrong proportions. Interesting enough, this would mean
   * that neither the entities would be necessary.
   */
  async loadTilesets() {
    const scale = this.renderer.getScale();
    log.debug('Map - loadTilesets()', scale);
    const tileset2 = await this.loadTileset(`/img/2/tilesheet.png`);
    const tileset3 = await this.loadTileset(`/img/3/tilesheet.png`);
    this.tilesets.push(tileset2);
    this.tilesets.push(tileset3);
    this.renderer.setTileset(this.tilesets[scale - 2]);
    this.tilesetsLoaded = true;
  }

  async updateTileset() {
    const scale = this.renderer.getDrawingScale();

    if (scale > 2 && !this.tilesets[1]) {
      this.tilesets.push(await this.loadTileset('/img/3/tilesheet.png'));
    }

    this.renderer.setTileset(this.tilesets[scale - 2]);
  }

  async loadTileset(path) {
    return new Promise((resolve) => {
      const tileset = new Image();
      tileset.crossOrigin = 'Anonymous';
      tileset.src = path;
      tileset.loaded = true;
      tileset.scale = this.renderer.getDrawingScale();

      tileset.onload = () => {
        if (tileset.width % this.tileSize > 0) {
          throw Error(`The tile size is malformed in the tile set: ${path}`);
        }
        resolve(tileset);
      };
    });
  }

  parseMap(map) {
    this.width = map.width;
    this.height = map.height;
    this.tileSize = map.tilesize;
    this.data = map.data;
    this.blocking = map.blocking || [];
    this.collisions = map.collisions;
    this.high = map.high;
    this.animated = map.animated;
  }

  loadCollisions() {
    this.grid = [];

    for (let i = 0; i < this.height; i += 1) {
      this.grid[i] = [];
      for (let j = 0; j < this.width; j += 1) {
        this.grid[i][j] = 0;
      }
    }

    _.each(this.collisions, (index) => {
      const position = this.indexToGridPosition(index + 1);
      this.grid[position.y][position.x] = 1;
    });

    _.each(this.blocking, (index) => {
      const position = this.indexToGridPosition(index + 1);

      if (this.grid[position.y]) {
        this.grid[position.y][position.x] = 1;
      }
    });
  }

  indexToGridPosition(index) {
    index -= 1; // eslint-disable-line

    const x = this.getX(index + 1, this.width);
    const y = Math.floor(index / this.width);

    return {
      x,
      y,
    };
  }

  gridPositionToIndex(x, y) {
    return y * this.width + x + 1;
  }

  isColliding(x, y) {
    if (this.isOutOfBounds(x, y) || !this.grid) {
      return false;
    }
    return this.grid[y][x] === 1;
  }

  isHighTile(id) {
    return this.high.indexOf(id + 1) >= 0;
  }

  isAnimatedTile(id) {
    return id + 1 in this.animated;
  }

  isOutOfBounds(x, y) {
    return (
      isInt(x)
      && isInt(y)
      && (x < 0 || x >= this.width || y < 0 || y >= this.height)
    );
  }

  getX(index, width) {
    if (index === 0) {
      return 0;
    }

    return index % width === 0 ? width - 1 : (index % width) - 1;
  }

  getTileAnimationLength(id) {
    return this.animated[id + 1].l;
  }

  getTileAnimationDelay(id) {
    const properties = this.animated[id + 1];
    return properties.d ? properties.d : 150;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
}
