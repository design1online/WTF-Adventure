import Map from './map';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('jquery', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Mock Worker globally before Map is used
const mockWorker = {
  postMessage: jest.fn(),
  onmessage: null,
};
global.Worker = jest.fn(() => mockWorker);

// Mock Image globally
global.Image = jest.fn().mockImplementation(() => ({
  set src(val) { /* no-op */ },
  get src() { return ''; },
  onload: null,
  crossOrigin: '',
  width: 64,
  loaded: false,
  scale: 1,
}));

const makeGame = (supportsWorker = true) => ({
  renderer: {
    getScale: jest.fn(() => 2),
    getDrawingScale: jest.fn(() => 2),
    setTileset: jest.fn(),
  },
  client: {
    hasWorker: jest.fn(() => supportsWorker),
  },
});

const sampleMapData = {
  width: 10,
  height: 10,
  tilesize: 16,
  data: new Array(100).fill(0),
  blocking: [],
  collisions: [5, 15],
  high: [3, 7],
  animated: { 4: { l: 4, d: 100 } },
  grid: [],
};

describe('Map', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence ready() polling setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('initializes default properties', () => {
      const game = makeGame(true);
      const map = new Map(game);
      expect(map.game).toBe(game);
      expect(map.renderer).toBe(game.renderer);
      expect(map.data).toEqual([]);
      expect(map.tilesets).toEqual([]);
      expect(map.grid).toBeNull();
      expect(map.tilesetsLoaded).toBe(false);
      expect(map.mapLoaded).toBe(false);
    });
  });

  describe('parseMap()', () => {
    it('sets all map properties from the data object', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      expect(map.width).toBe(10);
      expect(map.height).toBe(10);
      expect(map.tileSize).toBe(16);
      expect(map.data).toBe(sampleMapData.data);
      expect(map.collisions).toBe(sampleMapData.collisions);
      expect(map.high).toBe(sampleMapData.high);
      expect(map.animated).toBe(sampleMapData.animated);
    });
  });

  describe('loadCollisions()', () => {
    it('builds a 2D grid and marks collision tiles', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      map.loadCollisions();
      expect(map.grid).toHaveLength(10);
      expect(map.grid[0]).toHaveLength(10);
    });
  });

  describe('indexToGridPosition()', () => {
    it('converts a flat index to an x,y grid position', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      const pos = map.indexToGridPosition(1);
      expect(pos).toHaveProperty('x');
      expect(pos).toHaveProperty('y');
    });
  });

  describe('gridPositionToIndex()', () => {
    it('returns the correct flat index for a grid position', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      expect(map.gridPositionToIndex(0, 0)).toBe(1);
      expect(map.gridPositionToIndex(1, 0)).toBe(2);
      expect(map.gridPositionToIndex(0, 1)).toBe(11);
    });
  });

  describe('isColliding()', () => {
    it('returns false when grid is null', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      map.grid = null;
      expect(map.isColliding(0, 0)).toBe(false);
    });

    it('returns false for out-of-bounds positions', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      map.loadCollisions();
      expect(map.isColliding(-1, 0)).toBe(false);
      expect(map.isColliding(0, 100)).toBe(false);
    });
  });

  describe('isHighTile()', () => {
    it('returns true for tiles in the high array', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      // high = [3,7], isHighTile checks id+1
      expect(map.isHighTile(2)).toBe(true);  // 2+1 = 3
      expect(map.isHighTile(0)).toBe(false);
    });
  });

  describe('isAnimatedTile()', () => {
    it('returns true for animated tile IDs', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      // animated = { 4: {...} }, isAnimatedTile checks id+1
      expect(map.isAnimatedTile(3)).toBe(true);  // 3+1 = 4
      expect(map.isAnimatedTile(0)).toBe(false);
    });
  });

  describe('isOutOfBounds()', () => {
    it('returns true when x or y exceed map dimensions', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      expect(map.isOutOfBounds(10, 0)).toBe(true);
      expect(map.isOutOfBounds(0, 10)).toBe(true);
      expect(map.isOutOfBounds(5, 5)).toBe(false);
    });
  });

  describe('getX()', () => {
    it('returns 0 for index 0', () => {
      const game = makeGame(true);
      const map = new Map(game);
      expect(map.getX(0, 10)).toBe(0);
    });

    it('calculates the correct x coordinate', () => {
      const game = makeGame(true);
      const map = new Map(game);
      expect(map.getX(1, 10)).toBe(0);
      expect(map.getX(2, 10)).toBe(1);
    });
  });

  describe('getTileAnimationLength()', () => {
    it('returns the animation length for an animated tile', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      expect(map.getTileAnimationLength(3)).toBe(4); // animated[4].l
    });
  });

  describe('getTileAnimationDelay()', () => {
    it('returns the custom delay when defined', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.parseMap(sampleMapData);
      expect(map.getTileAnimationDelay(3)).toBe(100); // animated[4].d
    });

    it('returns 150 as default delay when not defined', () => {
      const game = makeGame(true);
      const map = new Map(game);
      map.animated = { 1: { l: 2 } }; // no d property
      expect(map.getTileAnimationDelay(0)).toBe(150);
    });
  });

  describe('onReady()', () => {
    it('stores the ready callback', () => {
      const game = makeGame(true);
      const map = new Map(game);
      const cb = jest.fn();
      map.onReady(cb);
      expect(map.readyCallback).toBe(cb);
    });
  });
});
