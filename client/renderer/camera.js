import Modules from '../utils/modules';

/**
 * Tracks the visible viewport position and dimensions for the renderer
 * @class
 */
export default class Camera {
  /**
   * Default constructor
   * @param {Renderer} renderer an instance of the renderer
   */
  constructor(renderer) {
    /**
     * Reference to the renderer that owns this camera
     * @type {Renderer}
     */
    this.renderer = renderer;

    /**
     * Sub-tile offset used when centering the camera
     * @type {Number}
     */
    this.offset = 0.5;
    /**
     * The current pixel x-position of the camera
     * @type {Number}
     */
    this.x = 0;
    /**
     * The current pixel y-position of the camera
     * @type {Number}
     */
    this.y = 0;

    /**
     * The horizontal delta from the previous camera position
     * @type {Number}
     */
    this.dX = 0;
    /**
     * The vertical delta from the previous camera position
     * @type {Number}
     */
    this.dY = 0;

    /**
     * The current grid x-coordinate of the camera's top-left corner
     * @type {Number}
     */
    this.gridX = 0;
    /**
     * The current grid y-coordinate of the camera's top-left corner
     * @type {Number}
     */
    this.gridY = 0;

    /**
     * The grid x-coordinate from the previous camera update
     * @type {Number}
     */
    this.prevGridX = 0;
    /**
     * The grid y-coordinate from the previous camera update
     * @type {Number}
     */
    this.prevGridY = 0;

    /**
     * The panning speed of the camera
     * @type {Number}
     */
    this.speed = 1;
    /**
     * Whether the camera is currently being panned by keyboard input
     * @type {Boolean}
     */
    this.panning = false;
    /**
     * Whether the camera is centred on the player
     * @type {Boolean}
     */
    this.centered = true;
    /**
     * The player entity that the camera may follow
     * @type {?Entity}
     */
    this.player = null;

    this.update();
  }

  /**
   * Recalculates the visible grid dimensions based on the renderer upscale factor
   */
  update() {
    const factor = this.renderer.getUpscale();

    /**
     * The number of tiles visible horizontally
     * @type {Number}
     */
    this.gridWidth = 15 * factor;
    /**
     * The number of tiles visible vertically
     * @type {Number}
     */
    this.gridHeight = 8 * factor;
  }

  /**
   * Moves the camera to an absolute pixel position and updates the grid coordinates
   * @param {Number} x the new pixel x-position
   * @param {Number} y the new pixel y-position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;

    this.prevGridX = this.gridX;
    this.prevGridY = this.gridY;

    this.gridX = Math.floor(x / 16);
    this.gridY = Math.floor(y / 16);
  }

  /**
   * Snaps the camera position to the nearest tile boundary
   */
  clip() {
    this.setGridPosition(Math.round(this.x / 16), Math.round(this.y / 16));
  }

  /**
   * Enables centred camera mode and re-centres on the current player
   */
  center() {
    if (this.centered) {
      return;
    }

    this.centered = true;
    this.centreOn(this.player);

    this.renderer.verifyCentration();
  }

  /**
   * Disables centred camera mode and clips to the nearest tile position
   */
  decenter() {
    if (!this.centered) {
      return;
    }

    this.clip();
    this.centered = false;

    this.renderer.verifyCentration();
  }

  /**
   * Moves the camera to an absolute grid position and updates pixel coordinates
   * @param {Number} x the grid x-coordinate
   * @param {Number} y the grid y-coordinate
   */
  setGridPosition(x, y) {
    this.prevGridX = this.gridX;
    this.prevGridY = this.gridY;

    this.gridX = x;
    this.gridY = y;

    this.x = this.gridX * 16;
    this.y = this.gridY * 16;
  }

  /**
   * Stores the player reference and centres the camera on them immediately
   * @param {Entity} player the player entity to track
   */
  setPlayer(player) {
    this.player = player;

    this.centreOn(this.player);
  }

  /**
   * Moves the camera one pixel in the given direction when panning is active
   * @param {Number} direction a Modules.Keys direction constant
   */
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

  /**
   * Centres the camera on the given entity's position
   * @param {Entity} entity the entity to centre on
   */
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

  /**
   * Moves the camera viewport to the next zone in the given orientation direction
   * @param {Number} direction a Modules.Orientation direction constant
   */
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

  /**
   * Iterates over every grid position currently visible to the camera
   * @param {Function} callback called with (x, y) for each visible grid position
   * @param {Number} offset optional number of extra tiles to include around the viewport edge
   */
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
