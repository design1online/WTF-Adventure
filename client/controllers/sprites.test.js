jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../entity/sprite', () => {
  return jest.fn().mockImplementation((data, scale) => ({
    id: data.id,
    scale,
    update: jest.fn(),
  }));
});

jest.mock('../entity/animation', () => {
  return jest.fn().mockImplementation((name, frames, row, width, height) => ({
    name,
    frames,
    row,
    width,
    height,
    setSpeed: jest.fn(),
    update: jest.fn(),
  }));
});

// Mock jQuery with getJSON support
jest.mock('jquery', () => {
  const mockGetJSON = jest.fn();
  const jq = jest.fn(() => ({
    css: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }));
  jq.fn = {};
  jq.getJSON = mockGetJSON;
  return jq;
});

import $ from 'jquery';
import Sprites from './sprites';
import Sprite from '../entity/sprite';
import Animation from '../entity/animation';

describe('Sprites', () => {
  let sprites;
  let mockRenderer;

  beforeEach(() => {
    jest.clearAllMocks();

    // Prevent getJSON callback from firing during construction
    $.getJSON.mockImplementation(() => {});

    mockRenderer = {
      drawingScale: 2,
      getDrawingScale: jest.fn().mockReturnValue(2),
    };

    sprites = new Sprites(mockRenderer);
  });

  describe('constructor', () => {
    test('sets renderer reference', () => {
      expect(sprites.renderer).toBe(mockRenderer);
    });

    test('initializes sprites as empty object', () => {
      expect(sprites.sprites).toEqual({});
    });

    test('initializes sparksAnimation via loadAnimations', () => {
      expect(sprites.sparksAnimation).toBeDefined();
    });

    test('sets loadedSpritesCallback to null', () => {
      expect(sprites.loadedSpritesCallback).toBeNull();
    });

    test('calls $.getJSON to load sprite data', () => {
      expect($.getJSON).toHaveBeenCalledWith('/data/sprites.json', expect.any(Function));
    });

    test('creates sparks animation with correct parameters', () => {
      expect(Animation).toHaveBeenCalledWith('idle_down', 6, 0, 16, 16);
    });

    test('sets sparks animation speed to 120', () => {
      expect(sprites.sparksAnimation.setSpeed).toHaveBeenCalledWith(120);
    });
  });

  describe('loadSpriteData', () => {
    test('creates Sprite instances for each item in data', () => {
      const spriteData = [
        { id: 'clotharmor', width: 32, height: 32 },
        { id: 'sword', width: 16, height: 16 },
      ];
      sprites.loadSpriteData(spriteData);
      expect(sprites.sprites['clotharmor']).toBeDefined();
      expect(sprites.sprites['sword']).toBeDefined();
    });

    test('calls Sprite constructor with correct scale', () => {
      sprites.loadSpriteData([{ id: 'test', width: 16, height: 16 }]);
      expect(Sprite).toHaveBeenCalledWith(
        { id: 'test', width: 16, height: 16 },
        2,
      );
    });

    test('calls loadedSpritesCallback when set', () => {
      const cb = jest.fn();
      sprites.loadedSpritesCallback = cb;
      sprites.loadSpriteData([{ id: 'clotharmor', width: 32, height: 32 }]);
      expect(cb).toHaveBeenCalled();
    });

    test('does not error when loadedSpritesCallback is null', () => {
      expect(() => sprites.loadSpriteData([{ id: 'a', width: 8, height: 8 }])).not.toThrow();
    });
  });

  describe('loadAnimations', () => {
    test('creates a sparksAnimation', () => {
      sprites.sparksAnimation = null;
      sprites.loadAnimations();
      expect(sprites.sparksAnimation).toBeDefined();
    });
  });

  describe('updateSprites', () => {
    test('calls update on each sprite', () => {
      sprites.loadSpriteData([
        { id: 'clotharmor', width: 32, height: 32 },
        { id: 'sword', width: 16, height: 16 },
      ]);
      sprites.updateSprites();
      expect(sprites.sprites['clotharmor'].update).toHaveBeenCalled();
      expect(sprites.sprites['sword'].update).toHaveBeenCalled();
    });

    test('does not throw when sprites is empty', () => {
      expect(() => sprites.updateSprites()).not.toThrow();
    });
  });

  describe('onLoadedSprites', () => {
    test('sets loadedSpritesCallback', () => {
      const cb = jest.fn();
      sprites.onLoadedSprites(cb);
      expect(sprites.loadedSpritesCallback).toBe(cb);
    });
  });
});
