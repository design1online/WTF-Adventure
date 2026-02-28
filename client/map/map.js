/* global Image, Worker */
import $ from 'jquery';
import _ from 'underscore';
import log from '../lib/log';
import {
  isInt,
} from '../utils/util';

/**
 * Manages the game world map data including tiles, collisions and tilesets
 * @class
 */
export default class Map {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   */
  constructor(game) {
    /**
     * Reference to the main game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * Reference to the game renderer
     * @type {Renderer}
     */
    this.renderer = this.game.renderer;
    /**
     * Whether the browser supports Web Workers for map parsing
     * @type {Boolean}
     */
    this.supportsWorker = this.game.client.hasWorker();
    /**
     * The flat tile data array for the map
     * @type {Array}
     */
    this.data = [];
    /**
     * The loaded tileset images indexed by scale
     * @type {Array}
     */
    this.tilesets = [];
    /**
     * The 2D collision grid for pathfinding
     * @type {Array|null}
     */
    this.grid = null;
    /**
     * Whether the tilesets have finished loading
     * @type {Boolean}
     */
    this.tilesetsLoaded = false;
    /**
     * Whether the map data has finished loading
     * @type {Boolean}
     */
    this.mapLoaded = false;

    this.loadMap();
    this.loadTilesets();
    this.ready();
  }

  /**
   * Polls until both the map and tilesets are loaded, then fires the ready callback
   */
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

  /**
   * Loads the map data using a Web Worker if supported, otherwise falls back to Ajax
   */
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

  /**
   * Updates the active tileset based on the current drawing scale
   */
  async updateTileset() {
    const scale = this.renderer.getDrawingScale();

    if (scale > 2 && !this.tilesets[1]) {
      this.tilesets.push(await this.loadTileset('/img/3/tilesheet.png'));
    }

    this.renderer.setTileset(this.tilesets[scale - 2]);
  }

  /**
   * Loads a single tileset image and resolves with the loaded Image element
   * @param {String} path the URL path to the tileset image
   * @return {Promise<Image>} resolves with the loaded tileset image
   */
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

  /**
   * Parses the raw map data object and sets map properties
   * @param {Object} map the raw map data object from the server or worker
   */
  parseMap(map) {
    /**
     * The width of the map in tiles
     * @type {Number}
     */
    this.width = map.width;
    /**
     * The height of the map in tiles
     * @type {Number}
     */
    this.height = map.height;
    /**
     * The size of each tile in pixels
     * @type {Number}
     */
    this.tileSize = map.tilesize;
    /**
     * The flat array of tile IDs for the entire map
     * @type {Array}
     */
    this.data = map.data;
    /**
     * List of tile indices that block movement
     * @type {Array}
     */
    this.blocking = map.blocking || [];
    /**
     * List of tile indices that cause collisions
     * @type {Array}
     */
    this.collisions = map.collisions;
    /**
     * List of tile IDs that are rendered above entities
     * @type {Array}
     */
    this.high = map.high;
    /**
     * Map of animated tile definitions keyed by tile ID
     * @type {Object}
     */
    this.animated = map.animated;
  }

  /**
   * Builds the 2D collision grid from the collision and blocking tile lists
   */
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

  /**
   * Converts a flat tile index to a 2D grid position
   * @param {Number} index the 1-based flat tile index
   * @return {{x: Number, y: Number}} the grid position
   */
  indexToGridPosition(index) {
    index -= 1; // eslint-disable-line

    const x = this.getX(index + 1, this.width);
    const y = Math.floor(index / this.width);

    return {
      x,
      y,
    };
  }

  /**
   * Converts a 2D grid position to a flat tile index
   * @param {Number} x the grid column
   * @param {Number} y the grid row
   * @return {Number} the 1-based flat tile index
   */
  gridPositionToIndex(x, y) {
    return y * this.width + x + 1;
  }

  /**
   * Returns whether a grid position contains a collision
   * @param {Number} x the grid column
   * @param {Number} y the grid row
   * @return {Boolean} true if the position is colliding
   */
  isColliding(x, y) {
    if (this.isOutOfBounds(x, y) || !this.grid) {
      return false;
    }
    return this.grid[y][x] === 1;
  }

  /**
   * Returns whether a tile ID is rendered above entities
   * @param {Number} id the tile ID to check
   * @return {Boolean} true if the tile is a high tile
   */
  isHighTile(id) {
    return this.high.indexOf(id + 1) >= 0;
  }

  /**
   * Returns whether a tile ID has animation data
   * @param {Number} id the tile ID to check
   * @return {Boolean} true if the tile is animated
   */
  isAnimatedTile(id) {
    return id + 1 in this.animated;
  }

  /**
   * Returns whether a grid position is outside the map bounds
   * @param {Number} x the grid column
   * @param {Number} y the grid row
   * @return {Boolean} true if the position is out of bounds
   */
  isOutOfBounds(x, y) {
    return (
      isInt(x)
      && isInt(y)
      && (x < 0 || x >= this.width || y < 0 || y >= this.height)
    );
  }

  /**
   * Computes the X coordinate from a flat tile index and map width
   * @param {Number} index the flat tile index
   * @param {Number} width the map width in tiles
   * @return {Number} the X grid coordinate
   */
  getX(index, width) {
    if (index === 0) {
      return 0;
    }

    return index % width === 0 ? width - 1 : (index % width) - 1;
  }

  /**
   * Returns the frame count of an animated tile's animation
   * @param {Number} id the tile ID
   * @return {Number} the animation length
   */
  getTileAnimationLength(id) {
    return this.animated[id + 1].l;
  }

  /**
   * Returns the frame delay in milliseconds for an animated tile
   * @param {Number} id the tile ID
   * @return {Number} the animation delay in milliseconds
   */
  getTileAnimationDelay(id) {
    const properties = this.animated[id + 1];
    return properties.d ? properties.d : 150;
  }

  /**
   * Registers a callback to be invoked when the map is fully loaded
   * @param {Function} callback the function to call when the map is ready
   */
  onReady(callback) {
    /** @type {Function} */
    this.readyCallback = callback;
  }
}
