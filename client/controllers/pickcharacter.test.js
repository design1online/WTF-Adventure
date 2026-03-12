jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('./sprites', () => {
  return jest.fn().mockImplementation(() => ({
    sprites: {
      clotharmor: { id: 'clotharmor' },
    },
    updateSprites: jest.fn(),
    onLoadedSprites: jest.fn(),
  }));
});

jest.mock('../entity/character/player/player', () => {
  return jest.fn().mockImplementation(() => ({
    id: 'player-1',
    type: 'player',
    gridX: 0,
    gridY: 0,
    dropped: false,
    setGridPosition: jest.fn(),
    setSprite: jest.fn(),
    idle: jest.fn(),
    loadHandler: jest.fn(),
    fadeIn: jest.fn(),
    handler: {
      setGame: jest.fn(),
      loadEntity: jest.fn(),
    },
  }));
});

jest.mock('../entity/objects/item', () => {
  return jest.fn().mockImplementation(() => ({
    type: 'item',
    dropped: false,
    id: 'item-1',
    gridX: 0,
    gridY: 0,
    fadeIn: jest.fn(),
  }));
});

import PickCharacter from './pickcharacter';
import Sprites from './sprites';
import Item from '../entity/objects/item';

describe('PickCharacter', () => {
  let pickCharacter;
  let mockGame;
  let mockGrids;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGrids = {
      addToEntityGrid: jest.fn(),
      addToPathingGrid: jest.fn(),
      addToItemGrid: jest.fn(),
      addToRenderingGrid: jest.fn(),
      removeFromRenderingGrid: jest.fn(),
      removeFromPathingGrid: jest.fn(),
      removeFromItemGrid: jest.fn(),
      removeEntity: jest.fn(),
      resetPathingGrid: jest.fn(),
      entityGrid: {},
      pathingGrid: {},
      renderingGrid: {},
    };

    mockGame = {
      renderer: {
        isPortableDevice: jest.fn().mockReturnValue(false),
        drawingScale: 2,
        getDrawingScale: jest.fn().mockReturnValue(2),
      },
      client: {
        sendStatus: jest.fn(),
      },
      time: 1000,
    };

    pickCharacter = new PickCharacter(mockGame);
    pickCharacter.grids = mockGrids;
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(pickCharacter.game).toBe(mockGame);
    });

    test('sets renderer reference', () => {
      expect(pickCharacter.renderer).toBe(mockGame.renderer);
    });

    test('initializes grids as null', () => {
      const fresh = new PickCharacter(mockGame);
      expect(fresh.grids).toBeNull();
    });

    test('initializes sprites as null', () => {
      expect(pickCharacter.sprites).toBeNull();
    });

    test('initializes entities as empty object', () => {
      expect(pickCharacter.entities).toEqual({});
    });
  });

  describe('loadCharacter', () => {
    test('sends status messages via client', () => {
      pickCharacter.loadCharacter();
      expect(mockGame.client.sendStatus).toHaveBeenCalledWith('Inviting craziness...');
      expect(mockGame.client.sendStatus).toHaveBeenCalledWith('Lots of spooky monsters...');
    });

    test('creates a Sprites instance when sprites is null', () => {
      pickCharacter.sprites = null;
      pickCharacter.loadCharacter();
      expect(Sprites).toHaveBeenCalled();
      expect(pickCharacter.sprites).toBeDefined();
    });

    test('does not recreate Sprites if already exists', () => {
      const existingSprites = { updateSprites: jest.fn() };
      pickCharacter.sprites = existingSprites;
      pickCharacter.loadCharacter();
      expect(pickCharacter.sprites).toBe(existingSprites);
    });
  });

  describe('update', () => {
    test('calls updateSprites when sprites exists', () => {
      const mockSprites = { updateSprites: jest.fn() };
      pickCharacter.sprites = mockSprites;
      pickCharacter.update();
      expect(mockSprites.updateSprites).toHaveBeenCalled();
    });

    test('does not throw when sprites is null', () => {
      pickCharacter.sprites = null;
      expect(() => pickCharacter.update()).not.toThrow();
    });
  });

  describe('get', () => {
    test('returns entity by id when it exists', () => {
      const entity = { id: 'abc', type: 'mob' };
      pickCharacter.entities['abc'] = entity;
      expect(pickCharacter.get('abc')).toBe(entity);
    });

    test('returns null when entity does not exist', () => {
      expect(pickCharacter.get('nonexistent')).toBeNull();
    });
  });

  describe('exists', () => {
    test('returns true when entity exists', () => {
      pickCharacter.entities['abc'] = { id: 'abc' };
      expect(pickCharacter.exists('abc')).toBe(true);
    });

    test('returns false when entity does not exist', () => {
      expect(pickCharacter.exists('xyz')).toBe(false);
    });
  });

  describe('addEntity', () => {
    test('adds entity to entities object', () => {
      const entity = {
        id: 'e1',
        type: 'mob',
        gridX: 2,
        gridY: 3,
        dropped: false,
        fadeIn: jest.fn(),
      };
      pickCharacter.addEntity(entity);
      expect(pickCharacter.entities['e1']).toBe(entity);
    });

    test('does not add duplicate entities', () => {
      const entity = {
        id: 'e1',
        type: 'mob',
        gridX: 2,
        gridY: 3,
        dropped: false,
        fadeIn: jest.fn(),
      };
      pickCharacter.addEntity(entity);
      pickCharacter.addEntity(entity);
      expect(Object.keys(pickCharacter.entities)).toHaveLength(1);
    });

    test('calls registerPosition for new entity', () => {
      const registerSpy = jest.spyOn(pickCharacter, 'registerPosition');
      const entity = {
        id: 'e2',
        type: 'mob',
        gridX: 1,
        gridY: 1,
        dropped: false,
        fadeIn: jest.fn(),
      };
      pickCharacter.addEntity(entity);
      expect(registerSpy).toHaveBeenCalledWith(entity);
    });

    test('calls fadeIn for non-dropped non-portable entities', () => {
      const entity = {
        id: 'e3',
        type: 'mob',
        gridX: 1,
        gridY: 1,
        dropped: false,
        fadeIn: jest.fn(),
      };
      pickCharacter.addEntity(entity);
      expect(entity.fadeIn).toHaveBeenCalledWith(mockGame.time);
    });

    test('does not call fadeIn on portable devices', () => {
      mockGame.renderer.isPortableDevice.mockReturnValue(true);
      const entity = {
        id: 'e4',
        type: 'mob',
        gridX: 1,
        gridY: 1,
        dropped: false,
        fadeIn: jest.fn(),
      };
      pickCharacter.addEntity(entity);
      expect(entity.fadeIn).not.toHaveBeenCalled();
    });
  });

  describe('registerPosition', () => {
    test('returns early for null entity', () => {
      expect(() => pickCharacter.registerPosition(null)).not.toThrow();
    });

    test('calls addToEntityGrid for player type', () => {
      const entity = { id: 'p1', type: 'player', gridX: 0, gridY: 0, nonPathable: false };
      pickCharacter.registerPosition(entity);
      expect(mockGrids.addToEntityGrid).toHaveBeenCalledWith(entity, 0, 0);
    });

    test('calls addToRenderingGrid for all entity types', () => {
      const entity = { id: 'e1', type: 'mob', gridX: 2, gridY: 3 };
      pickCharacter.registerPosition(entity);
      expect(mockGrids.addToRenderingGrid).toHaveBeenCalledWith(entity, 2, 3);
    });

    test('calls addToItemGrid for item type', () => {
      const entity = { id: 'i1', type: 'item', gridX: 5, gridY: 5 };
      pickCharacter.registerPosition(entity);
      expect(mockGrids.addToItemGrid).toHaveBeenCalledWith(entity, 5, 5);
    });
  });

  describe('unregisterPosition', () => {
    test('returns early for null entity', () => {
      expect(() => pickCharacter.unregisterPosition(null)).not.toThrow();
    });

    test('calls grids.removeEntity for a valid entity', () => {
      const entity = { id: 'e1', type: 'mob', gridX: 1, gridY: 1 };
      pickCharacter.unregisterPosition(entity);
      expect(mockGrids.removeEntity).toHaveBeenCalledWith(entity);
    });
  });

  describe('getAll', () => {
    test('returns all entities', () => {
      pickCharacter.entities['e1'] = { id: 'e1' };
      expect(pickCharacter.getAll()).toBe(pickCharacter.entities);
    });
  });

  describe('forEachEntity', () => {
    test('applies callback to each entity', () => {
      const cb = jest.fn();
      pickCharacter.entities['a'] = { id: 'a' };
      pickCharacter.entities['b'] = { id: 'b' };
      pickCharacter.forEachEntity(cb);
      expect(cb).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeItem', () => {
    test('returns early for null item', () => {
      expect(() => pickCharacter.removeItem(null)).not.toThrow();
    });

    test('removes item from entities', () => {
      const item = { id: 'item1', gridX: 1, gridY: 1 };
      pickCharacter.entities['item1'] = item;
      pickCharacter.removeItem(item);
      expect(pickCharacter.entities['item1']).toBeUndefined();
    });
  });

  describe('getSprite', () => {
    test('returns sprite from sprites by name', () => {
      pickCharacter.sprites = {
        sprites: {
          clotharmor: { id: 'clotharmor' },
        },
      };
      expect(pickCharacter.getSprite('clotharmor')).toEqual({ id: 'clotharmor' });
    });
  });
});
