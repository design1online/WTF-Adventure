/* global document */
import _ from 'underscore';
import $ from 'jquery';
import log from '../lib/log';
import Camera from './camera';
import Tile from './tile';
import Character from '../entity/character/character';
import Item from '../entity/objects/item';
import Detect from '../utils/detect';
import { isIntersecting } from '../utils/util';

/**
 * Returns the x-coordinate within a grid row given a flat index and row width
 * @param {Number} index the flat tile index
 * @param {Number} width the width of the grid in tiles
 * @return {Number}
 */
const getX = (index, width) => {
  if (index === 0) {
    return 0;
  }

  return index % width === 0
    ? width - 1
    : (index % width) - 1;
};

/**
 * Handles all canvas-based rendering for the game world
 * @class
 */
export default class Renderer {
  /**
   * Default constructor
   * @param {HTMLCanvasElement} backgroundCanvas the canvas for background tiles
   * @param {HTMLCanvasElement} entitiesCanvas the canvas for entities
   * @param {HTMLCanvasElement} foregroundCanvas the canvas for foreground tiles
   * @param {HTMLCanvasElement} textCanvas the canvas for text and UI labels
   * @param {HTMLCanvasElement} cursorCanvas the canvas for the cursor
   * @param {Game} game an instance of the game
   */
  constructor(backgroundCanvas, entitiesCanvas, foregroundCanvas, textCanvas, cursorCanvas, game) {
    /**
     * The background tile canvas element
     * @type {HTMLCanvasElement}
     */
    this.backgroundCanvas = backgroundCanvas;
    /**
     * The entities canvas element
     * @type {HTMLCanvasElement}
     */
    this.entitiesCanvas = entitiesCanvas;
    /**
     * The foreground tile canvas element
     * @type {HTMLCanvasElement}
     */
    this.foregroundCanvas = foregroundCanvas;
    /**
     * The text canvas element
     * @type {HTMLCanvasElement}
     */
    this.textCanvas = textCanvas;
    /**
     * The cursor canvas element
     * @type {HTMLCanvasElement}
     */
    this.cursorCanvas = cursorCanvas;

    /**
     * The 2D rendering context for entities
     * @type {CanvasRenderingContext2D}
     */
    this.context = entitiesCanvas.getContext('2d');
    /**
     * The 2D rendering context for the background
     * @type {CanvasRenderingContext2D}
     */
    this.backContext = backgroundCanvas.getContext('2d');
    /**
     * The 2D rendering context for the foreground
     * @type {CanvasRenderingContext2D}
     */
    this.foreContext = foregroundCanvas.getContext('2d');
    /**
     * The 2D rendering context for text
     * @type {CanvasRenderingContext2D}
     */
    this.textContext = textCanvas.getContext('2d');
    /**
     * The 2D rendering context for the cursor
     * @type {CanvasRenderingContext2D}
     */
    this.cursorContext = cursorCanvas.getContext('2d');

    this.context.imageSmoothingEnabled = false;
    this.backContext.imageSmoothingEnabled = false;
    this.foreContext.imageSmoothingEnabled = false;
    this.textContext.imageSmoothingEnabled = true;
    this.cursorContext.imageSmoothingEnabled = false;

    /**
     * Array of all drawing contexts used for tile and entity rendering
     * @type {CanvasRenderingContext2D[]}
     */
    this.contexts = [this.backContext, this.foreContext, this.context];
    /**
     * Array of all canvas elements managed by the renderer
     * @type {HTMLCanvasElement[]}
     */
    this.canvases = [
      this.backgroundCanvas,
      this.entitiesCanvas,
      this.foregroundCanvas,
      this.textCanvas,
      this.cursorCanvas,
    ];

    /**
     * Reference to the main game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The camera used to determine visible area
     * @type {Camera}
     */
    this.camera = null;
    /**
     * The entities controller
     * @type {Entities}
     */
    this.entities = null;
    /**
     * The input handler
     * @type {Input}
     */
    this.input = null;

    this.checkDevice();

    /**
     * The current rendering scale factor
     * @type {Number}
     */
    this.scale = 1;
    /**
     * The size of a single tile in pixels
     * @type {Number}
     */
    this.tileSize = 16;
    /**
     * The base font size for rendered text
     * @type {Number}
     */
    this.fontSize = 10;

    /**
     * The screen width in pixels
     * @type {Number}
     */
    this.screenWidth = 0;
    /**
     * The screen height in pixels
     * @type {Number}
     */
    this.screenHeight = 0;

    /**
     * Timestamp used for FPS calculation
     * @type {Date}
     */
    this.time = new Date();

    /**
     * The current frames per second value
     * @type {Number}
     */
    this.fps = 0;
    /**
     * Number of frames rendered in the current second
     * @type {Number}
     */
    this.frameCount = 0;
    /**
     * The last rendered camera position [x, y]
     * @type {Number[]}
     */
    this.renderedFrame = [0, 0];
    /**
     * The last target cell position [x, y]
     * @type {Number[]}
     */
    this.lastTarget = [0, 0];

    /**
     * List of tiles that are currently animated
     * @type {Tile[]}
     */
    this.animatedTiles = [];

    /**
     * Timeout handle used to debounce resize events
     * @type {?number}
     */
    this.resizeTimeout = null;
    /**
     * Whether to automatically centre the camera on the player
     * @type {Boolean}
     */
    this.autoCentre = false;

    /**
     * Whether to draw the target cell indicator
     * @type {Boolean}
     */
    this.drawTarget = false;
    /**
     * Whether the selected cell highlight is currently visible
     * @type {Boolean}
     */
    this.selectedCellVisible = false;

    /**
     * When true the render loop is paused
     * @type {Boolean}
     */
    this.stopRendering = false;
    /**
     * Whether tile animations are enabled
     * @type {Boolean}
     */
    this.animateTiles = true;
    /**
     * Whether to render debug information
     * @type {Boolean}
     */
    this.debugging = false;
    /**
     * The current brightness level (0-100)
     * @type {Number}
     */
    this.brightness = 100;
    /**
     * Whether to draw entity names above characters
     * @type {Boolean}
     */
    this.drawNames = true;
    /**
     * Whether to draw entity levels above characters
     * @type {Boolean}
     */
    this.drawLevels = false;
    /**
     * When true the next frame will be rendered even if the camera has not moved
     * @type {Boolean}
     */
    this.forceRendering = false;
    this.textCanvas = $('#textCanvas');

    this.loadRenderer();
  }

  /**
   * Stops all rendering and fills each canvas with the background colour
   */
  stop() {
    log.debug('Renderer - stop()');

    this.camera = null;
    this.input = null;
    this.stopRendering = true;

    this.forEachContext((context) => {
      context.fillStyle = '#12100D'; // eslint-disable-line
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    });
  }

  /**
   * Initialises scale and drawing scale values and disables image smoothing on all contexts
   */
  loadRenderer() {
    log.debug('Renderer - loadRenderer()');

    this.scale = this.getScale();
    /** @type {Number} */
    this.drawingScale = this.getDrawingScale();

    this.forEachContext((context) => {
      context.imageSmoothingEnabled = false; // eslint-disable-line
      context.webkitImageSmoothingEnabled = false; // eslint-disable-line
      context.mozImageSmoothingEnabled = false; // eslint-disable-line
      context.msImageSmoothingEnabled = false; // eslint-disable-line
      context.oImageSmoothingEnabled = false; // eslint-disable-line
    });
  }

  /**
   * Recalculates screen dimensions based on the camera grid size and resizes all canvases
   */
  loadSizes() {
    // log.debug('Renderer - loadSizes()');

    if (!this.camera) {
      return;
    }

    this.screenWidth = this.camera.gridWidth * this.tileSize;
    this.screenHeight = this.camera.gridHeight * this.tileSize;

    const width = $('#container').width() - this.camera.gridWidth;
    const height = $('#container').height() - this.camera.gridHeight;

    this.forEachCanvas((canvas) => {
      canvas.width = width; // eslint-disable-line
      canvas.height = height; // eslint-disable-line
    });
  }

  /**
   * Creates a new Camera and adjusts centring settings based on device capabilities
   */
  loadCamera() {
    // log.debug('Renderer - loadCamera()');

    const { storage } = this.game;
    this.camera = new Camera(this);

    this.loadSizes();

    if (
      storage.data.new
      && (this.firefox
        || parseFloat(Detect.androidVersion()) < 6.0
        || parseFloat(Detect.iOSVersion() < 9.0)
        || Detect.isIpad())
    ) {
      this.camera.centered = false;

      storage.data.settings.centerCamera = false;
      storage.save();
    }
  }

  /**
   * Handles window resize events by debouncing a full renderer refresh
   */
  resize() {
    // log.debug('Renderer - resize()');

    this.stopRendering = true;

    this.clearAll();
    this.checkDevice();

    if (!this.resizeTimeout) {
      this.resizeTimeout = setTimeout(() => {
        this.scale = this.getScale();
        this.drawingScale = this.getDrawingScale();

        if (this.camera) {
          this.camera.update();
        }

        this.updateAnimatedTiles();

        this.loadSizes();

        if (this.entities) {
          this.entities.update();
        }

        if (this.map) {
          this.map.updateTileset();
        }

        if (this.camera) {
          this.camera.centreOn(this.game.player);
        }

        if (this.game.interface) {
          this.game.interface.resize();
        }

        this.renderedFrame[0] = -1;
        this.stopRendering = false;
        this.resizeTimeout = null;
      }, 500);
    }
  }

  /**
   * Main render function called each frame to draw the full game scene
   */
  render() {
    // log.debug('Renderer - render()');

    if (this.stopRendering) {
      return;
    }

    this.clearScreen(this.context);
    this.clearText();
    this.saveAll();

    /**
     * Rendering related draws
     */
    this.draw();
    this.drawAnimatedTiles();

    // the annoying square under the cursor
    // this.drawTargetCell();

    this.drawSelectedCell();
    this.drawEntities();
    this.drawInfos();
    this.drawDebugging();
    this.restoreAll();
    this.drawCursor();
  }

  /**
   * Context Drawing
   */

  /**
   * Draws all static (non-animated) visible tiles onto the background and foreground contexts
   */
  draw() {
    // log.debug('Renderer - draw()');

    if (this.hasRenderedFrame()) {
      // log.debug('has rendered rate', this.hasRenderedFrame());
      return;
    }

    this.clearDrawing();
    this.updateDrawingView();

    this.forEachVisibleTile((id, index) => {
      const isHighTile = this.map.isHighTile(id);
      const context = isHighTile ? this.foreContext : this.backContext;

      if (!this.map.isAnimatedTile(id) || !this.animateTiles) {
        this.drawTile(
          context,
          id,
          this.tileset,
          this.tileset.width / this.tileSize,
          this.map.width,
          index,
        );
      }
    });

    this.saveFrame();
  }

  /**
   * Draws all animated tiles onto the entities context each frame
   */
  drawAnimatedTiles() {
    // log.debug('Renderer - drawAnimatedTiles()');

    this.setCameraView(this.context);

    if (!this.animateTiles) {
      return;
    }

    this.forEachAnimatedTile((tile) => {
      this.drawTile(
        this.context,
        tile.id,
        this.tileset,
        this.tileset.width / this.tileSize,
        this.map.width,
        tile.index,
      );
      tile.loaded = true; // eslint-disable-line
    });
  }

  /**
   * Draws floating damage and status info text above entities
   */
  drawInfos() {
    // log.debug('Renderer - drawInfos()');

    if (this.game.info.getCount() === 0) {
      return;
    }

    this.game.info.forEachInfo((info) => {
      const factor = this.mobile ? 2 : 1;

      this.textContext.save();
      this.textContext.font = '24px sans serif';
      this.setCameraView(this.textContext);
      this.textContext.globalAlpha = info.opacity;
      this.drawText(
        `${info.text}`,
        Math.floor((info.x + 8) * factor),
        Math.floor(info.y * factor),
        true,
        info.fill,
        info.stroke,
      );
      this.textContext.restore();
    });
  }

  /**
   * Draws debug overlays such as FPS, player position and the pathing grid
   */
  drawDebugging() {
    // log.debug('Renderer - drawDebugging()');

    if (!this.debugging) {
      return;
    }

    this.drawFPS();

    if (!this.mobile) {
      this.drawPosition();
      this.drawPathing();
    }
  }

  /**
   * Iterates over all visible entities and draws each one that has a loaded sprite
   */
  drawEntities() {
    // log.debug('Renderer - drawEntities()');

    this.forEachVisibleEntity((entity) => {
      if (entity.spriteLoaded) {
        // log.debug('drawEntities', entity);
        this.drawEntity(entity);
      }
    });
  }

  /**
   * Renders a single entity including its shadow, weapon overlay, item sparks and status effects
   * @param {Entity} entity the entity to draw
   */
  drawEntity(entity) {
    // log.debug('Renderer - drawEntity()', entity);

    const { sprite } = entity;
    const animation = entity.currentAnimation;
    const data = entity.renderingData;

    if (!sprite || !animation || !entity.isVisible()) {
      return;
    }

    const frame = animation.currentFrame;
    const x = frame.x * this.drawingScale;
    const y = frame.y * this.drawingScale;
    const dx = entity.x * this.drawingScale;
    const dy = entity.y * this.drawingScale;
    const flipX = dx + this.tileSize * this.drawingScale;
    const flipY = dy + data.height;

    this.context.save();

    if (data.scale !== this.scale || data.sprite !== sprite) {
      data.scale = this.scale;
      data.sprite = sprite;
      data.width = sprite.width * this.drawingScale;
      data.height = sprite.height * this.drawingScale;
      data.ox = sprite.offsetX * this.drawingScale;
      data.oy = sprite.offsetY * this.drawingScale;

      if (entity.angled) {
        data.angle = (entity.angle * Math.PI) / 180;
      }

      if (entity.hasShadow()) {
        data.shadowWidth = this.shadowSprite.width * this.drawingScale;
        data.shadowHeight = this.shadowSprite.height * this.drawingScale;
        data.shadowOffsetY = entity.shadowOffsetY * this.drawingScale;
      }
    }

    if (entity.fading) {
      this.context.globalAlpha = entity.fadingAlpha;
    }

    if (entity.spriteFlipX) {
      this.context.translate(flipX, dy);
      this.context.scale(-1, 1);
    } else if (entity.spriteFlipY) {
      this.context.translate(dx, flipY);
      this.context.scale(1, -1);
    } else this.context.translate(dx, dy);

    if (entity.angled) {
      this.context.rotate(data.angle);
    }

    if (entity.hasShadow()) {
      this.context.drawImage(
        this.shadowSprite.image,
        0,
        0,
        data.shadowWidth,
        data.shadowHeight,
        0,
        data.shadowOffsetY,
        data.shadowWidth,
        data.shadowHeight,
      );
    }

    this.drawEntityBack(entity);

    this.context.drawImage(
      sprite.image,
      x,
      y,
      data.width,
      data.height,
      data.ox,
      data.oy,
      data.width,
      data.height,
    );

    if (
      entity instanceof Character
      && !entity.dead
      && !entity.teleporting
      && entity.hasWeapon()
    ) {
      const weaponSprite = this.entities.getSprite(entity.weapon.getName());

      if (weaponSprite) {
        if (!weaponSprite.loaded) {
          weaponSprite.loadSprite();
        }

        const weaponAnimationData = weaponSprite.animationData[animation.name];

        const index = frame.index < weaponAnimationData.length
          ? frame.index
          : frame.index % weaponAnimationData.length;


        const weaponX = weaponSprite.width * index * this.drawingScale;
        const weaponY = weaponSprite.height * animation.row * this.drawingScale;
        const weaponWidth = weaponSprite.width * this.drawingScale;
        const weaponHeight = weaponSprite.height * this.drawingScale;

        this.context.drawImage(
          weaponSprite.image,
          weaponX,
          weaponY,
          weaponWidth,
          weaponHeight,
          weaponSprite.offsetX * this.drawingScale,
          weaponSprite.offsetY * this.drawingScale,
          weaponWidth,
          weaponHeight,
        );
      }
    }

    if (entity instanceof Item) {
      const {
        sparksAnimation,
      } = this.entities.sprites;
      const sparksFrame = sparksAnimation.currentFrame;

      if (data.scale !== this.scale) {
        data.sparksX = this.sparksSprite.width * sparksFrame.index * this.drawingScale;
        data.sparksY = this.sparksSprite.height * sparksAnimation.row * this.drawingScale;

        data.sparksWidth = this.sparksSprite.width * this.drawingScale;
        data.sparksHeight = this.sparksSprite.height * this.drawingScale;
      }

      this.context.drawImage(
        this.sparksSprite.image,
        data.sparksX,
        data.sparksY,
        data.sparksWidth,
        data.sparksHeight,
        0,
        0,
        data.sparksWidth,
        data.sparksHeight,
      );
    }

    this.drawEntityFore(entity);

    this.context.restore();

    this.drawHealth(entity);
    this.drawName(entity);
  }

  /**
   * Function used to draw special effects prior
   * to rendering the entity.
   */
  drawEntityBack(entity) {
    // const self = this;
    // @TODO
  }

  /**
   * Draws active status-effect sprite overlays on top of the entity after it has been rendered
   * @param {Entity} entity the entity to draw effects for
   */
  drawEntityFore(entity) {
    // log.debug('Renderer - drawEntityFore()');

    /**
     * Function used to draw special effects after
     * having rendererd the entity
     */

    if (
      entity.terror
      || entity.stunned
      || entity.critical
      || entity.explosion
    ) {
      const sprite = this.entities.getSprite(entity.getActiveEffect());

      if (!sprite.loaded) {
        sprite.loadSprite();
      }

      if (sprite) {
        const animation = entity.getEffectAnimation();
        const { index } = animation.currentFrame;
        const x = sprite.width * index * this.drawingScale;
        const y = sprite.height * animation.row * this.drawingScale;
        const width = sprite.width * this.drawingScale;
        const height = sprite.height * this.drawingScale;
        const offsetX = sprite.offsetX * this.drawingScale;
        const offsetY = sprite.offsetY * this.drawingScale;

        this.context.drawImage(
          sprite.image,
          x,
          y,
          width,
          height,
          offsetX,
          offsetY,
          width,
          height,
        );
      }
    }
  }

  /**
   * Draws a health bar above an entity when its health bar is visible
   * @param {Entity} entity the entity whose health bar should be drawn
   */
  drawHealth(entity) {
    // log.debug('Renderer - entity()');

    if (!entity.hitPoints || entity.hitPoints < 0 || !entity.healthBarVisible) {
      return;
    }

    const barLength = 16;
    const healthX = entity.x * this.drawingScale - barLength / 2 + 8;
    const healthY = (entity.y - 9) * this.drawingScale;

    const healthWidth = Math.round(
      (entity.hitPoints / entity.maxHitPoints)
      * barLength
      * this.drawingScale,
    );

    const healthHeight = 2 * this.drawingScale;

    this.context.save();
    this.context.strokeStyle = '#00000';
    this.context.lineWidth = 1;
    this.context.strokeRect(
      healthX,
      healthY,
      barLength * this.drawingScale,
      healthHeight,
    );
    this.context.fillStyle = '#FD0000';
    this.context.fillRect(healthX, healthY, healthWidth, healthHeight);
    this.context.restore();
  }

  /**
   * Draws the username and/or level label above an entity
   * @param {Entity} entity the entity whose name should be drawn
   */
  drawName(entity) {
    // log.debug('Renderer - drawName()');

    if (entity.hidden || (!this.drawNames && !this.drawLevels)) {
      return;
    }

    let colour = entity.wanted ? 'red' : 'white';
    const factor = this.mobile ? 2 : 1;

    if (entity.rights > 1) {
      colour = '#ba1414';
    } else if (entity.rights > 0) {
      colour = '#a59a9a';
    }

    if (entity.id === this.game.player.id) {
      colour = '#fcda5c';
    }

    this.textContext.save();
    this.setCameraView(this.textContext);
    this.textContext.font = '14px sans serif';

    if (!entity.hasCounter) {
      if (this.drawNames && entity !== 'player') {
        this.drawText(
          entity.username,
          (entity.x + 8) * factor,
          (entity.y - (this.drawLevels ? 20 : 10)) * factor,
          true,
          colour,
        );
      }

      if (
        this.drawLevels
        && (entity.type === 'mob' || entity.type === 'player')
      ) {
        this.drawText(
          `Level ${entity.level}`,
          (entity.x + 8) * factor,
          (entity.y - 10) * factor,
          true,
          colour,
        );
      }

      if (entity.type === 'item' && entity.count > 1) {
        this.drawText(
          entity.count,
          (entity.x + 8) * factor,
          (entity.y - 10) * factor,
          true,
          colour,
        );
      }
    } else {
      if (this.game.time - entity.countdownTime > 1000) {
        entity.countdownTime = this.game.time; // eslint-disable-line
        entity.counter -= 1; // eslint-disable-line
      }

      if (entity.counter <= 0) {
        entity.hasCounter = false; // eslint-disable-line
      }

      this.drawText(
        entity.counter,
        (entity.x + 8) * factor,
        (entity.y - 10) * factor,
        true,
        colour,
      );
    }

    this.textContext.restore();
  }

  /**
   * Draws the custom mouse cursor sprite on the cursor canvas
   */
  drawCursor() {
    // log.debug('Renderer - drawCursor()');

    if (this.tablet || this.mobile) {
      return;
    }

    const { cursor } = this.input;

    this.clearScreen(this.cursorContext);
    this.cursorContext.save();

    if (cursor && this.scale > 1) {
      if (!cursor.loaded) {
        cursor.loadSprite();
      }

      if (cursor.loaded) {
        this.cursorContext.drawImage(
          cursor.image,
          0,
          0,
          14 * this.drawingScale,
          14 * this.drawingScale,
          this.input.mouse.x,
          this.input.mouse.y,
          14 * this.drawingScale,
          14 * this.drawingScale,
        );
      }
    }

    this.cursorContext.restore();
  }

  /**
   * Calculates and draws the current frames-per-second counter on screen
   */
  drawFPS() {
    // log.debug('Renderer - drawFPS()');

    const currentTime = new Date();
    const timeDiff = currentTime - this.time;

    if (timeDiff >= 1000) {
      /** @type {Number} */
      this.realFPS = this.frameCount;
      this.frameCount = 0;
      this.time = currentTime;
      this.fps = this.realFPS;
    }

    this.frameCount += 1;

    this.drawText(`FPS: ${this.realFPS}`, 10, 11, false, 'white');
  }

  /**
   * Draws the player's current grid position to the screen for debugging
   */
  drawPosition() {
    // log.debug('Renderer - drawPosition()');

    const { player } = this.game;

    this.drawText(
      `x: ${player.gridX} y: ${player.gridY}`,
      10,
      31,
      false,
      'white',
    );
  }

  /**
   * Highlights all non-zero cells in the pathing grid for debugging
   */
  drawPathing() {
    // log.debug('Renderer - drawPathing()');

    const { pathingGrid } = this.entities.grids;

    if (!pathingGrid) {
      return;
    }

    this.camera.forEachVisiblePosition((x, y) => {
      if (x < 0 || y < 0) {
        return;
      }

      if (pathingGrid[y][x] !== 0) {
        this.drawCellHighlight(x, y, 'rgba(50, 50, 255, 0.5)');
      }
    });
  }

  /**
   * Draws a highlight over the cell the player has selected when it is not adjacent
   */
  drawSelectedCell() {
    // log.debug('Renderer - drawSelectedCell()');

    if (!this.input.selectedCellVisible) {
      return;
    }

    const posX = this.input.selectedX;
    const posY = this.input.selectedY;

    // only draw the highlight cell if they are not adjacent
    // from character's current position
    if (!this.game.player.isPositionAdjacent(posX, posY)) {
      this.drawCellHighlight(posX, posY, this.input.mobileTargetColour);
    }
  }

  /**
   * Primitive drawing functions
   */

  /**
   * Draws a single tile from the tileset onto the given context at the correct grid position
   * @param {CanvasRenderingContext2D} context the context to draw onto
   * @param {Number} tileId the tile identifier
   * @param {HTMLImageElement} tileset the tileset image
   * @param {Number} setWidth the number of tiles per row in the tileset
   * @param {Number} gridWidth the width of the map in tiles
   * @param {Number} cellId the flat index of the cell in the map grid
   */
  drawTile(context, tileId, tileset, setWidth, gridWidth, cellId) {
    // log.debug('Renderer - draw()', context, tileId, tileset, setWidth, gridWidth, cellId);

    if (tileId === -1) {
      return;
    }

    this.drawScaledImage(
      context,
      tileset,
      getX(tileId + 1, setWidth / this.drawingScale) * this.tileSize,
      Math.floor(tileId / (setWidth / this.drawingScale)) * this.tileSize,
      this.tileSize,
      this.tileSize,
      getX(cellId + 1, gridWidth) * this.tileSize,
      Math.floor(cellId / gridWidth) * this.tileSize,
    );
  }

  /**
   * Clears the pixel area occupied by a single tile cell on the given context
   * @param {CanvasRenderingContext2D} context the context to clear on
   * @param {Number} gridWidth the width of the map in tiles
   * @param {Number} cellId the flat index of the cell to clear
   */
  clearTile(context, gridWidth, cellId) {
    // log.debug('Renderer - clearTile()', context, gridWidth, cellId);

    const x = getX(cellId + 1, gridWidth) * this.tileSize * this.drawingScale;
    const y = Math.floor(cellId / gridWidth) * this.tileSize * this.drawingScale;
    const w = this.tileSize * this.scale;

    context.clearRect(x, y, w, w);
  }

  /**
   * Draws a string of text at the specified canvas coordinates
   * @param {String} text the text to render
   * @param {Number} x the x position in tile units
   * @param {Number} y the y position in tile units
   * @param {Boolean} centered whether to centre-align the text
   * @param {String} colour the fill colour
   * @param {String} strokeColour the stroke/outline colour
   */
  drawText(text, x, y, centered, colour, strokeColour) {
    // log.debug('Renderer - drawText()', text, x, y, centered, colour, strokeColour);

    let strokeSize = 1;
    const context = this.textContext;

    if (this.scale > 2) {
      strokeSize = 3;
    }

    if (text && x && y) {
      context.save();

      if (centered) {
        context.textAlign = 'center';
      }

      context.strokeStyle = strokeColour || '#373737';
      context.lineWidth = strokeSize;
      context.strokeText(text, x * this.scale, y * this.scale);
      context.fillStyle = colour || 'white';
      context.fillText(text, x * this.scale, y * this.scale);

      context.restore();
    }
  }

  /**
   * Draws a portion of an image scaled to the current drawing scale factor
   * @param {CanvasRenderingContext2D} context the context to draw onto
   * @param {HTMLImageElement} image the source image
   * @param {Number} x the source x offset in unscaled pixels
   * @param {Number} y the source y offset in unscaled pixels
   * @param {Number} width the width of the source region in unscaled pixels
   * @param {Number} height the height of the source region in unscaled pixels
   * @param {Number} dx the destination x position in unscaled pixels
   * @param {Number} dy the destination y position in unscaled pixels
   */
  drawScaledImage(context, image, x, y, width, height, dx, dy) {
    // log.debug('Renderer - drawScaledImage()', context, image, x, y, width, height, dx, dy);

    if (!context) {
      return;
    }

    context.drawImage(
      image,
      x * this.drawingScale,
      y * this.drawingScale,
      width * this.drawingScale,
      height * this.drawingScale,
      dx * this.drawingScale,
      dy * this.drawingScale,
      width * this.drawingScale,
      height * this.drawingScale,
    );
  }

  /**
   * Rebuilds the list of animated tiles that are currently within the visible camera area
   */
  updateAnimatedTiles() {
    // log.debug('Renderer - updateAnimatedTiles()');

    if (!this.animateTiles) {
      return;
    }

    const newTiles = [];

    this.forEachVisibleTile((id, index) => {
      /**
       * We don't want to reinitialize animated tiles that already exist
       * and are within the visible camera proportions. This way we can parse
       * it every time the tile moves slightly.
       */

      if (!this.map.isAnimatedTile(id)) {
        return;
      }

      /**
       * Push the pre-existing tiles.
       */

      const tileIndex = this.animatedTiles.indexOf(id);

      if (tileIndex > -1) {
        newTiles.push(this.animatedTiles[tileIndex]);
        return;
      }

      const tile = new Tile(
        id,
        index,
        this.map.getTileAnimationLength(id),
        this.map.getTileAnimationDelay(id),
      );

      const position = this.map.indexToGridPosition(tile.index);

      tile.setPosition(position);
      newTiles.push(tile);
    }, 2);

    this.animatedTiles = newTiles;
  }

  /**
   * Checks whether a bounding rectangle overlaps with nearby entities or tiles and marks them dirty
   * @param {Object} rectOne the bounding rectangle to test against
   * @param {Object} source the source entity or tile that caused the check
   * @param {Number} x the grid x-coordinate around which to search
   * @param {Number} y the grid y-coordinate around which to search
   */
  checkDirty(rectOne, source, x, y) {
    // log.debug('Renderer - checkDirty()', rectOne, source, x, y);

    this.entities.forEachEntityAround(x, y, 2, (entityTwo) => {
      if (source && source.id && entityTwo.id === source.id) return;

      if (!entityTwo.isDirty && isIntersecting(rectOne, this.getEntityBounds(entityTwo))) {
        entityTwo.loadDirty();
      }
    });

    if (source && !source.hasOwnProperty('index')) { // eslint-disable-line
      this.forEachAnimatedTile((tile) => {
        if (!tile.isDirty && isIntersecting(rectOne, this.getTileBounds(tile))) {
          tile.dirty = true; // eslint-disable-line
        }
      });
    }

    if (!this.drawTarget && this.input.selectedCellVisible) {
      const targetRect = this.getTargetBounds();

      if (isIntersecting(rectOne, targetRect)) {
        this.drawTarget = true;
        /** @type {Object} */
        this.targetRect = targetRect;
      }
    }
  }

  /**
   * Draws a hollow coloured rectangle outline around a single grid cell
   * @param {Number} x the pixel x position of the cell
   * @param {Number} y the pixel y position of the cell
   * @param {String} colour the CSS colour to use for the stroke
   */
  drawCellRect(x, y, colour) {
    // log.debug('Renderer - drawCellRect()', x, y, colour);

    const multiplier = this.tileSize * this.drawingScale;

    this.context.save();
    this.context.lineWidth = 2 * this.drawingScale;
    this.context.translate(x + 2, y + 2);
    this.context.strokeStyle = colour;
    this.context.strokeRect(0, 0, multiplier - 4, multiplier - 4);
    this.context.restore();
  }

  /**
   * Draws a coloured highlight rectangle over a grid cell at the given grid coordinates
   * @param {Number} x the grid x-coordinate of the cell
   * @param {Number} y the grid y-coordinate of the cell
   * @param {String} colour the CSS colour to use for the highlight
   */
  drawCellHighlight(x, y, colour) {
    // log.debug('Renderer - drawCellHighlight()', x, y, colour);

    this.drawCellRect(
      x * this.drawingScale * this.tileSize,
      y * this.drawingScale * this.tileSize,
      colour,
    );
  }

  /**
   * Draws a highlight over the cell currently under the mouse cursor
   */
  drawTargetCell() {
    // log.debug('Renderer - drawTargetCell()');

    if (
      this.mobile
      || this.tablet
      || !this.input.targetVisible
      || !this.input
      || !this.camera
    ) {
      return;
    }

    const location = this.input.getCoords();

    if (
      !(
        location.x === this.input.selectedX
        && location.y === this.input.selectedY
      )
    ) {
      this.drawCellHighlight(location.x, location.y, this.input.targetColour);
    }
  }

  /**
   * Primordial Rendering functions
   */

  /**
   * Iterates over every map index currently visible to the camera and invokes a callback
   * @param {Function} callback called with each visible map index
   * @param {Number} offset optional tile offset to expand the visible area
   */
  forEachVisibleIndex(callback, offset) {
    // log.debug('Renderer - forEachVisibleIndex()', callback, offset);

    this.camera.forEachVisiblePosition((x, y) => {
      if (!this.map.isOutOfBounds(x, y)) callback(this.map.gridPositionToIndex(x, y) - 1);
    }, offset);
  }

  /**
   * Iterates over all tile IDs in the visible area and invokes a callback for each
   * @param {Function} callback called with (tileId, mapIndex) for each visible tile
   * @param {Number} offset optional tile offset to expand the visible area
   */
  forEachVisibleTile(callback, offset) {
    // log.debug('Renderer - forEachVisibleTile()', callback, offset);

    if (!this.map || !this.map.mapLoaded) {
      return;
    }

    this.forEachVisibleIndex((index) => {
      if (_.isArray(this.map.data[index])) {
        _.each(this.map.data[index], (id) => {
          callback(id - 1, index);
        });
      } else if (!isNaN(this.map.data[index] - 1)) { // eslint-disable-line
        callback(this.map.data[index] - 1, index);
      }
    }, offset);
  }

  /**
   * Iterates over all currently tracked animated tiles and invokes a callback for each
   * @param {Function} callback called with each animated Tile instance
   */
  forEachAnimatedTile(callback) {
    // log.debug('Renderer - forEachAnimatedTile()', callback);

    _.each(this.animatedTiles, (tile) => {
      callback(tile);
    });
  }

  /**
   * Iterates over all entities occupying visible grid cells and invokes a callback for each
   * @param {Function} callback called with each visible Entity instance
   */
  forEachVisibleEntity(callback) {
    // log.debug('Renderer - forEachVisibleEntity()', callback);

    if (!this.entities || !this.camera) {
      return;
    }

    const { grids } = this.entities;

    this.camera.forEachVisiblePosition((x, y) => {
      if (!this.map.isOutOfBounds(x, y) && grids.renderingGrid[y][x]) {
        _.each(grids.renderingGrid[y][x], (entity) => {
          callback(entity);
        });
      }
    });
  }

  /**
   * Returns true when the given grid position falls within the camera viewport
   * @param {Number} x the grid x-coordinate to test
   * @param {Number} y the grid y-coordinate to test
   * @return {Boolean}
   */
  isVisiblePosition(x, y) {
    // log.debug('Renderer - isVisiblePosition()', x, y);

    return (
      y >= this.camera.gridY
      && y < this.camera.gridY + this.camera.gridHeight
      && x >= this.camera.gridX
      && x < this.camera.gridX + this.camera.gridWidth
    );
  }

  /**
   * Returns the current rendering scale factor from the game
   * @return {Number}
   */
  getScale() {
    // log.debug('Renderer - getScale()');

    return this.game.getScaleFactor();
  }

  /**
   * Returns the drawing scale factor, clamped to 2 on mobile devices
   * @return {Number}
   */
  getDrawingScale() {
    // log.debug('Renderer - getDrawingScale()');

    let scale = this.getScale();

    if (this.mobile) {
      scale = 2;
    }

    return scale;
  }

  /**
   * Returns the upscale factor capped at a maximum of 2
   * @return {Number}
   */
  getUpscale() {
    // log.debug('Renderer - getUpscale()');

    let scale = this.getScale();

    if (scale > 2) {
      scale = 2;
    }

    return scale;
  }

  /**
   * Clears the entities canvas context
   */
  clearContext() {
    // log.debug('Renderer - clearContext()');

    this.context.clearRect(
      0,
      0,
      this.screenWidth * this.scale,
      this.screenHeight * this.scale,
    );
  }

  /**
   * Clears the entire text canvas context
   */
  clearText() {
    // log.debug('Renderer - clearText()');

    this.textContext.clearRect(
      0,
      0,
      this.textCanvas.width * this.scale,
      this.textCanvas.height * this.scale,
    );
  }

  /**
   * Calls restore on every tracked rendering context
   */
  restore() {
    // log.debug('Renderer - restore()');

    this.forEachContext((context) => {
      context.restore();
    });
  }

  /**
   * Clears every tracked rendering context
   */
  clearAll() {
    // log.debug('Renderer - clearAll()');

    this.forEachContext((context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });
  }

  /**
   * Clears only the background and foreground drawing contexts
   */
  clearDrawing() {
    // log.debug('Renderer - clearDrawing()');

    this.forEachDrawingContext((context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });
  }

  /**
   * Saves the state of every tracked rendering context
   */
  saveAll() {
    // log.debug('Renderer - saveAll()');

    this.forEachContext((context) => {
      context.save();
    });
  }

  /**
   * Restores the state of every tracked rendering context
   */
  restoreAll() {
    // log.debug('Renderer - restoreAll()');

    this.forEachContext((context) => {
      context.restore();
    });
  }

  /**
   * Focuses every tracked rendering context
   */
  focus() {
    // log.debug('Renderer - focus()');

    this.forEachContext((context) => {
      context.focus();
    });
  }

  /**
   * Rendering Functions
   */

  /**
   * Applies the camera translation to every tracked rendering context
   */
  updateView() {
    // log.debug('Renderer - updateView()');

    this.forEachContext((context) => {
      this.setCameraView(context);
    });
  }

  /**
   * Applies the camera translation to all drawing (non-entity) contexts
   */
  updateDrawingView() {
    // log.debug('Renderer - updateDrawingView()');

    this.forEachDrawingContext((context) => {
      this.setCameraView(context);
    });
  }

  /**
   * Translates a context so that the camera position maps to the top-left of the canvas
   * @param {CanvasRenderingContext2D} context the context to apply the camera translation to
   */
  setCameraView(context) {
    // log.debug('Renderer - setCameraView()');

    if (!this.camera || this.stopRendering) {
      return;
    }

    context.translate(
      -this.camera.x * this.drawingScale,
      -this.camera.y * this.drawingScale,
    );
  }

  /**
   * Clears the full area of the given context
   * @param {CanvasRenderingContext2D} context the context to clear
   */
  clearScreen(context) {
    // log.debug('Renderer - clearScreen()', context);

    context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height,
    );
  }

  /**
   * Returns true if the current camera position matches the last rendered frame position
   * @return {Boolean}
   */
  hasRenderedFrame() {
    // log.debug('Renderer - hasRenderedFrame()');

    if (this.forceRendering) {
      return false;
    }

    if (!this.camera || this.stopRendering || !this.input) {
      return true;
    }

    return (
      this.renderedFrame[0] === this.camera.x
      && this.renderedFrame[1] === this.camera.y
    );
  }

  /**
   * Stores the current camera position as the last rendered frame
   */
  saveFrame() {
    // log.debug('Renderer - saveFrame()');

    if (!this.hasRenderedFrame()) {
      this.renderedFrame[0] = this.camera.x;
      this.renderedFrame[1] = this.camera.y;
    }
  }

  /**
   * Adjusts the canvas overlay opacity to achieve the desired brightness level
   * @param {Number} level the brightness level between 0 and 100
   */
  adjustBrightness(level) {
    // log.debug('Renderer - adjustBrightness()', level);

    if (level < 0 || level > 100) {
      return;
    }

    this.textCanvas.css(
      'background',
      `rgba(0, 0, 0, ${0.5 - level / 200})`,
    );
  }

  /**
   * Loads the shadow and sparks static sprites from the entity sprite store
   */
  loadStaticSprites() {
    log.debug('Renderer - loadStaticSprites()');

    /** @type {Sprite} */
    this.shadowSprite = this.entities.getSprite('shadow16');

    // if (!this.shadowSprite.loaded) {
    //   this.shadowSprite.loadSprite();
    // }

    /** @type {Sprite} */
    this.sparksSprite = this.entities.getSprite('sparks');

    // if (!this.sparksSprite.loaded) {
    //   this.sparksSprite.loadSprite();
    // }
  }

  /**
   * Miscellaneous functions
   */

  /**
   * Iterates over every tracked rendering context and invokes a callback for each
   * @param {Function} callback called with each CanvasRenderingContext2D
   */
  forEachContext(callback) {
    // log.debug('Renderer - forEachContext()', callback);

    _.each(this.contexts, (context) => {
      callback(context);
    });
  }

  /**
   * Iterates over drawing contexts (background and foreground) skipping the entities context
   * @param {Function} callback called with each drawing CanvasRenderingContext2D
   */
  forEachDrawingContext(callback) {
    // log.debug('Renderer - forEachDrawingContext()', callback);

    _.each(this.contexts, (context) => {
      if (context.canvas.id !== 'entities') {
        callback(context);
      }
    });
  }

  /**
   * Iterates over every tracked canvas element and invokes a callback for each
   * @param {Function} callback called with each HTMLCanvasElement
   */
  forEachCanvas(callback) {
    // log.debug('Renderer - forEachCanvas()', callback);

    _.each(this.canvases, (canvas) => {
      callback(canvas);
    });
  }

  /**
   * Detects whether the current device is mobile, tablet or Firefox and caches the result
   */
  checkDevice() {
    // log.debug('Renderer - checkDevice()');

    /**
     * Whether the client is running on a mobile device
     * @type {Boolean}
     */
    this.mobile = this.game.client.isMobile();
    /**
     * Whether the client is running on a tablet device
     * @type {Boolean}
     */
    this.tablet = this.game.client.isTablet();
    /**
     * Whether the client is running in Firefox
     * @type {Boolean}
     */
    this.firefox = Detect.isFirefox();
  }

  /**
   * Updates forceRendering based on whether the device is portable and the camera is centred
   */
  verifyCentration() {
    // log.debug('Renderer - verifyCentration()');

    this.forceRendering = (this.mobile || this.tablet) && this.camera.centered;
  }

  /**
   * Returns true if the current device is a mobile or tablet
   * @return {Boolean}
   */
  isPortableDevice() {
    // log.debug('Renderer - isPortableDevice()');

    return this.mobile || this.tablet;
  }

  /**
   * Setters
   */

  /**
   * Sets the tileset image used for tile rendering
   * @param {HTMLImageElement} tileset the tileset to use
   */
  setTileset(tileset) {
    log.debug('Renderer - setTileset()', tileset);

    /** @type {Object} */
    this.tileset = tileset;
  }

  /**
   * Sets the map instance used during rendering
   * @param {Map} map the map to use
   */
  setMap(map) {
    // log.debug('Renderer - setMap()', map);

    /** @type {Map} */
    this.map = map;
  }

  /**
   * Sets the entities controller used during rendering
   * @param {Entities} entities the entities controller to use
   */
  setEntities(entities) {
    // log.debug('Renderer - entities()', entities);

    this.entities = entities;
  }

  /**
   * Sets the input handler used during rendering
   * @param {Input} input the input handler to use
   */
  setInput(input) {
    // log.debug('Renderer - setInput()', input);

    this.input = input;
  }

  /**
   * Getters
   */

  /**
   * Calculates and returns the bounding rectangle for an animated tile in screen space
   * @param {Tile} tile the tile to compute bounds for
   * @return {Object}
   */
  getTileBounds(tile) {
    // log.debug('Renderer - getTileBounds()', tile);

    const bounds = {};
    const cellId = tile.index;

    bounds.x = (getX(cellId + 1, this.map.width) * this.tileSize
        - this.camera.x)
      * this.drawingScale;
    bounds.y = (Math.floor(cellId / this.map.width) * this.tileSize - this.camera.y)
      * this.drawingScale;
    bounds.width = this.tileSize * this.drawingScale;
    bounds.height = this.tileSize * this.drawingScale;
    bounds.left = bounds.x;
    bounds.right = bounds.x + bounds.width;
    bounds.top = bounds.y;
    bounds.bottom = bounds.y + bounds.height;

    return bounds;
  }

  /**
   * Calculates and returns the bounding rectangle for an entity in screen space
   * @param {Entity} entity the entity to compute bounds for
   * @return {Object}
   */
  getEntityBounds(entity) {
    // log.debug('Renderer - getEntityBounds()', entity);

    const bounds = {};
    const { sprite } = entity;

    // TODO - Ensure that the sprite over there has the correct bounds

    if (!sprite) {
      log.error(`Sprite malformation for: ${entity.name}`);
    } else {
      bounds.x = (entity.x + sprite.offsetX - this.camera.x) * this.drawingScale;
      bounds.y = (entity.y + sprite.offsetY - this.camera.y) * this.drawingScale;
      bounds.width = sprite.width * this.drawingScale;
      bounds.height = sprite.height * this.drawingScale;
      bounds.left = bounds.x;
      bounds.right = bounds.x + bounds.width;
      bounds.top = bounds.y;
      bounds.bottom = bounds.y + bounds.height;
    }

    return bounds;
  }

  /**
   * Calculates and returns the bounding rectangle for the current target cell in screen space
   * @param {Number} x optional grid x-coordinate override
   * @param {Number} y optional grid y-coordinate override
   * @return {Object}
   */
  getTargetBounds(x, y) {
    // log.debug('Renderer - getTargetBounds()', x, y);

    const bounds = {};
    const tx = x || this.input.selectedX;
    const ty = y || this.input.selectedY;

    bounds.x = (tx * this.tileSize - this.camera.x) * this.drawingScale;
    bounds.y = (ty * this.tileSize - this.camera.y) * this.drawingScale;
    bounds.width = this.tileSize * this.drawingScale;
    bounds.height = this.tileSize * this.drawingScale;
    bounds.left = bounds.x;
    bounds.right = bounds.x + bounds.width;
    bounds.top = bounds.y;
    bounds.bottom = bounds.y + bounds.height;

    return bounds;
  }

  /**
   * Returns the currently active tileset image
   * @return {HTMLImageElement}
   */
  getTileset() {
    // log.debug('Renderer - getTileset()');

    return this.tileset;
  }
}
