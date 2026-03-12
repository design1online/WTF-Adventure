// Mock canvas context globally before any imports
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 50 })),
  createPattern: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  strokeRect: jest.fn(),
  arc: jest.fn(),
  beginPath: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  rotate: jest.fn(),
  clip: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  globalAlpha: 1,
  fillStyle: '',
  strokeStyle: '',
  font: '',
  textAlign: '',
  imageSmoothingEnabled: true,
  webkitImageSmoothingEnabled: true,
  mozImageSmoothingEnabled: true,
  msImageSmoothingEnabled: true,
  oImageSmoothingEnabled: true,
  canvas: { id: 'entities', width: 800, height: 600 },
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => mockContext),
  configurable: true,
});

// Mock all imports
jest.mock('../lib/log', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('./camera', () => {
  return jest.fn().mockImplementation(() => ({
    x: 0,
    y: 0,
    gridWidth: 25,
    gridHeight: 19,
    centered: true,
    update: jest.fn(),
    centreOn: jest.fn(),
    setPlayer: jest.fn(),
    forEachVisiblePosition: jest.fn(),
  }));
});

jest.mock('./tile', () => {
  return jest.fn().mockImplementation((id, index) => ({ id, index, loaded: false }));
});

jest.mock('../entity/character/character', () => {
  class Character {}
  return Character;
});

jest.mock('../entity/objects/item', () => {
  class Item {}
  return Item;
});

jest.mock('../utils/detect', () => ({
  __esModule: true,
  default: {
    isFirefox: jest.fn().mockReturnValue(false),
    isMobile: jest.fn().mockReturnValue(false),
    isTablet: jest.fn().mockReturnValue(false),
    androidVersion: jest.fn().mockReturnValue('10'),
    iOSVersion: jest.fn().mockReturnValue('14'),
    isIpad: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../utils/util', () => ({
  requestAnimFrame: jest.fn(),
  isIntersecting: jest.fn().mockReturnValue(false),
}));

// Mock jQuery used in constructor (this.textCanvas = $('#textCanvas'))
const jqMock = jest.fn(() => ({
  prop: jest.fn().mockReturnThis(),
  val: jest.fn().mockReturnValue(''),
  width: jest.fn().mockReturnValue(800),
  height: jest.fn().mockReturnValue(600),
  addClass: jest.fn(),
  removeClass: jest.fn(),
  find: jest.fn().mockReturnThis(),
  css: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  show: jest.fn().mockReturnThis(),
  hide: jest.fn().mockReturnThis(),
}));
global.$ = jqMock;

import Renderer from './renderer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCanvas(id = 'entities') {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

function makeGame(overrides = {}) {
  return {
    getScaleFactor: jest.fn().mockReturnValue(2),
    client: {
      isMobile: jest.fn().mockReturnValue(false),
      isTablet: jest.fn().mockReturnValue(false),
    },
    player: {
      id: 1,
      x: 0,
      y: 0,
      gridX: 0,
      gridY: 0,
      getSpriteName: jest.fn().mockReturnValue('clotharmour'),
    },
    map: null,
    storage: {
      data: { new: false, settings: { centerCamera: true } },
      save: jest.fn(),
    },
    entities: null,
    input: null,
    info: { getCount: jest.fn().mockReturnValue(0), forEachInfo: jest.fn() },
    interface: null,
    ...overrides,
  };
}

function makeRenderer(gameOverrides = {}) {
  const bg = makeCanvas('background');
  const entities = makeCanvas('entities');
  const fg = makeCanvas('foreground');
  const text = makeCanvas('textCanvas');
  const cursor = makeCanvas('cursor');
  const game = makeGame(gameOverrides);
  return new Renderer(bg, entities, fg, text, cursor, game);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Renderer', () => {
  describe('constructor', () => {
    test('stores backgroundCanvas reference', () => {
      const bg = makeCanvas('background');
      const ent = makeCanvas('entities');
      const fg = makeCanvas('foreground');
      const txt = makeCanvas('textCanvas');
      const cur = makeCanvas('cursor');
      const game = makeGame();

      const renderer = new Renderer(bg, ent, fg, txt, cur, game);

      expect(renderer.backgroundCanvas).toBe(bg);
      expect(renderer.entitiesCanvas).toBe(ent);
      expect(renderer.foregroundCanvas).toBe(fg);
      expect(renderer.cursorCanvas).toBe(cur);
    });

    test('stores game reference', () => {
      const renderer = makeRenderer();
      expect(renderer.game).toBeDefined();
    });

    test('initializes camera to null', () => {
      const renderer = makeRenderer();
      expect(renderer.camera).toBeNull();
    });

    test('initializes entities to null', () => {
      const renderer = makeRenderer();
      expect(renderer.entities).toBeNull();
    });

    test('initializes input to null', () => {
      const renderer = makeRenderer();
      expect(renderer.input).toBeNull();
    });

    test('initializes tileSize to 16', () => {
      const renderer = makeRenderer();
      expect(renderer.tileSize).toBe(16);
    });

    test('initializes fontSize to 10', () => {
      const renderer = makeRenderer();
      expect(renderer.fontSize).toBe(10);
    });

    test('initializes fps to 0', () => {
      const renderer = makeRenderer();
      expect(renderer.fps).toBe(0);
    });

    test('scale is a number after construction', () => {
      const renderer = makeRenderer();
      expect(typeof renderer.scale).toBe('number');
    });

    test('initializes animateTiles to true', () => {
      const renderer = makeRenderer();
      expect(renderer.animateTiles).toBe(true);
    });

    test('initializes debugging to false', () => {
      const renderer = makeRenderer();
      expect(renderer.debugging).toBe(false);
    });

    test('initializes stopRendering to false', () => {
      const renderer = makeRenderer();
      expect(renderer.stopRendering).toBe(false);
    });

    test('initializes drawNames to true', () => {
      const renderer = makeRenderer();
      expect(renderer.drawNames).toBe(true);
    });

    test('initializes brightness to 100', () => {
      const renderer = makeRenderer();
      expect(renderer.brightness).toBe(100);
    });

    test('contexts array has 3 entries', () => {
      const renderer = makeRenderer();
      expect(renderer.contexts).toHaveLength(3);
    });

    test('canvases array has 5 entries', () => {
      const renderer = makeRenderer();
      expect(renderer.canvases).toHaveLength(5);
    });

    test('animatedTiles starts as empty array', () => {
      const renderer = makeRenderer();
      expect(renderer.animatedTiles).toEqual([]);
    });

    test('detects device type via checkDevice - mobile is boolean', () => {
      const renderer = makeRenderer();
      expect(typeof renderer.mobile).toBe('boolean');
    });

    test('detects device type via checkDevice - tablet is boolean', () => {
      const renderer = makeRenderer();
      expect(typeof renderer.tablet).toBe('boolean');
    });
  });

  describe('stop()', () => {
    test('sets camera to null', () => {
      const renderer = makeRenderer();
      renderer.camera = { x: 0, y: 0 };
      renderer.stop();
      expect(renderer.camera).toBeNull();
    });

    test('sets input to null', () => {
      const renderer = makeRenderer();
      renderer.input = { mouse: {} };
      renderer.stop();
      expect(renderer.input).toBeNull();
    });

    test('sets stopRendering to true', () => {
      const renderer = makeRenderer();
      renderer.stop();
      expect(renderer.stopRendering).toBe(true);
    });

    test('calls fillRect on contexts', () => {
      const renderer = makeRenderer();
      mockContext.fillRect.mockClear();
      renderer.stop();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('setters', () => {
    test('setTileset stores tileset', () => {
      const renderer = makeRenderer();
      const tileset = { width: 512, height: 512 };
      renderer.setTileset(tileset);
      expect(renderer.tileset).toBe(tileset);
    });

    test('setMap stores map', () => {
      const renderer = makeRenderer();
      const map = { width: 100, height: 100, isHighTile: jest.fn(), isAnimatedTile: jest.fn() };
      renderer.setMap(map);
      expect(renderer.map).toBe(map);
    });

    test('setEntities stores entities', () => {
      const renderer = makeRenderer();
      const entities = { grids: {}, sprites: {} };
      renderer.setEntities(entities);
      expect(renderer.entities).toBe(entities);
    });

    test('setInput stores input', () => {
      const renderer = makeRenderer();
      const input = { mouse: { x: 0, y: 0 } };
      renderer.setInput(input);
      expect(renderer.input).toBe(input);
    });
  });

  describe('getTileset()', () => {
    test('returns the stored tileset', () => {
      const renderer = makeRenderer();
      const tileset = { width: 256 };
      renderer.tileset = tileset;
      expect(renderer.getTileset()).toBe(tileset);
    });
  });

  describe('isPortableDevice()', () => {
    test('returns true when mobile', () => {
      const renderer = makeRenderer();
      renderer.mobile = true;
      renderer.tablet = false;
      expect(renderer.isPortableDevice()).toBe(true);
    });

    test('returns true when tablet', () => {
      const renderer = makeRenderer();
      renderer.mobile = false;
      renderer.tablet = true;
      expect(renderer.isPortableDevice()).toBe(true);
    });

    test('returns false when neither mobile nor tablet', () => {
      const renderer = makeRenderer();
      renderer.mobile = false;
      renderer.tablet = false;
      expect(renderer.isPortableDevice()).toBe(false);
    });
  });

  describe('verifyCentration()', () => {
    test('sets forceRendering to true when portable and camera centered', () => {
      const renderer = makeRenderer();
      renderer.mobile = true;
      renderer.camera = { centered: true };
      renderer.verifyCentration();
      expect(renderer.forceRendering).toBe(true);
    });

    test('sets forceRendering to false when not portable', () => {
      const renderer = makeRenderer();
      renderer.mobile = false;
      renderer.tablet = false;
      renderer.camera = { centered: true };
      renderer.verifyCentration();
      expect(renderer.forceRendering).toBe(false);
    });
  });

  describe('render()', () => {
    test('does not throw when stopRendering is true', () => {
      const renderer = makeRenderer();
      renderer.stopRendering = true;
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('loadRenderer()', () => {
    test('sets drawingScale after call', () => {
      const renderer = makeRenderer();
      renderer.loadRenderer();
      expect(typeof renderer.drawingScale).toBe('number');
    });

    test('sets scale after call', () => {
      const renderer = makeRenderer();
      renderer.loadRenderer();
      expect(typeof renderer.scale).toBe('number');
    });
  });

  describe('forEachContext()', () => {
    test('calls callback for all 3 contexts', () => {
      const renderer = makeRenderer();
      const cb = jest.fn();
      renderer.forEachContext(cb);
      expect(cb).toHaveBeenCalledTimes(3);
    });
  });

  describe('forEachCanvas()', () => {
    test('calls callback for each of 5 canvases', () => {
      const renderer = makeRenderer();
      const cb = jest.fn();
      renderer.forEachCanvas(cb);
      expect(cb).toHaveBeenCalledTimes(5);
    });
  });
});
