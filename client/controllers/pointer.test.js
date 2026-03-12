const mockJqueryElement = {
  css: jest.fn().mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  width: jest.fn().mockReturnValue(8),
  height: jest.fn().mockReturnValue(9.6),
};

jest.mock('jquery', () => {
  const jq = jest.fn(() => mockJqueryElement);
  jq.fn = {};
  return jq;
});

jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../utils/modules', () => ({
  Pointers: {
    Entity: 'entity',
    Position: 'position',
    Relative: 'relative',
  },
}));

jest.mock('../renderer/pointers/pointer', () => {
  return jest.fn().mockImplementation((id, element, type) => ({
    id,
    element,
    type,
    x: -1,
    y: -1,
    setPosition: jest.fn(),
    destroy: jest.fn(),
  }));
});

import Cursor from './pointer';

describe('Cursor (Pointer Controller)', () => {
  let cursor;
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      getScaleFactor: jest.fn().mockReturnValue(2),
      renderer: {
        getDrawingScale: jest.fn().mockReturnValue(2),
        camera: { x: 0, y: 0 },
      },
      entities: {
        get: jest.fn().mockReturnValue(null),
      },
    };

    cursor = new Cursor(mockGame);
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(cursor.game).toBe(mockGame);
    });

    test('initializes pointers as empty object', () => {
      expect(cursor.pointers).toEqual({});
    });

    test('initializes camera as null', () => {
      expect(cursor.camera).toBeNull();
    });

    test('sets scale from getScaleFactor', () => {
      expect(cursor.scale).toBe(2);
    });
  });

  describe('create', () => {
    test('creates a new pointer when id does not exist', () => {
      cursor.create(1, 'entity');
      expect(cursor.pointers[1]).toBeDefined();
    });

    test('does not create duplicate pointer for same id', () => {
      cursor.create(1, 'entity');
      cursor.create(1, 'entity');
      expect(Object.keys(cursor.pointers)).toHaveLength(1);
    });

    test('appends element to container', () => {
      cursor.create(1, 'entity');
      expect(mockJqueryElement.append).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    test('returns pointer by id when it exists', () => {
      cursor.create(1, 'entity');
      expect(cursor.get(1)).toBeDefined();
    });

    test('returns null when pointer does not exist', () => {
      expect(cursor.get(999)).toBeNull();
    });
  });

  describe('clean', () => {
    test('destroys all pointers and resets to empty object', () => {
      cursor.create(1, 'entity');
      cursor.create(2, 'position');
      const p1 = cursor.pointers[1];
      const p2 = cursor.pointers[2];
      cursor.clean();
      expect(p1.destroy).toHaveBeenCalled();
      expect(p2.destroy).toHaveBeenCalled();
      expect(cursor.pointers).toEqual({});
    });
  });

  describe('destroy', () => {
    test('destroys and removes a specific pointer', () => {
      cursor.create(1, 'entity');
      const pointer = cursor.pointers[1];
      cursor.destroy(pointer);
      expect(pointer.destroy).toHaveBeenCalled();
      expect(cursor.pointers[1]).toBeUndefined();
    });
  });

  describe('getScale', () => {
    test('returns game scale factor', () => {
      expect(cursor.getScale()).toBe(2);
    });
  });

  describe('getDrawingScale', () => {
    test('returns renderer drawing scale', () => {
      expect(cursor.getDrawingScale()).toBe(2);
    });
  });

  describe('updateScale', () => {
    test('updates scale from drawing scale', () => {
      mockGame.renderer.getDrawingScale.mockReturnValue(3);
      cursor.updateScale();
      expect(cursor.scale).toBe(3);
    });
  });

  describe('updateCamera', () => {
    test('updates camera from renderer camera', () => {
      const camera = { x: 100, y: 200 };
      mockGame.renderer.camera = camera;
      cursor.updateCamera();
      expect(cursor.camera).toBe(camera);
    });
  });

  describe('setToEntity', () => {
    test('does nothing when entity pointer does not exist', () => {
      const entity = { id: 999, x: 10, y: 20 };
      expect(() => cursor.setToEntity(entity)).not.toThrow();
    });
  });

  describe('setToPosition', () => {
    test('does nothing when pointer does not exist', () => {
      expect(() => cursor.setToPosition(999, 10, 20)).not.toThrow();
    });
  });

  describe('setRelative', () => {
    test('does nothing when pointer does not exist', () => {
      expect(() => cursor.setRelative(999, 10, 20)).not.toThrow();
    });
  });

  describe('update', () => {
    test('destroys pointer when entity is not found (entity type)', () => {
      cursor.create(1, 'entity');
      const PointerClass = require('../renderer/pointers/pointer');
      // Override the pointer type to 'entity'
      cursor.pointers[1].type = 'entity';
      cursor.pointers[1].id = 1;
      mockGame.entities.get.mockReturnValue(null);

      const destroySpy = jest.spyOn(cursor, 'destroy');
      cursor.update();
      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
