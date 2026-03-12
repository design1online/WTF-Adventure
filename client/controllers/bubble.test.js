const mockJqueryElement = {
  appendTo: jest.fn().mockReturnThis(),
  css: jest.fn().mockReturnThis(),
  html: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
};

const mockJquery = jest.fn((selector) => mockJqueryElement);
mockJquery.fn = {};

jest.mock('jquery', () => {
  const jq = jest.fn((selector) => mockJqueryElement);
  jq.fn = {};
  return jq;
});

jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../renderer/bubbles/blob', () => {
  return jest.fn().mockImplementation((id, time, element, duration) => ({
    id,
    time,
    element,
    duration: duration || 5000,
    reset: jest.fn(),
    destroy: jest.fn(),
    isOver: jest.fn().mockReturnValue(false),
  }));
});

import $ from 'jquery';
import Blob from '../renderer/bubbles/blob';
import Bubble from './bubble';

describe('Bubble', () => {
  let bubble;
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      renderer: {
        getDrawingScale: jest.fn().mockReturnValue(2),
        scale: 1,
      },
      getCamera: jest.fn().mockReturnValue({ x: 0, y: 0 }),
      entities: {
        get: jest.fn().mockReturnValue(null),
      },
    };

    bubble = new Bubble(mockGame);
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(bubble.game).toBe(mockGame);
    });

    test('initializes bubbles as empty object', () => {
      expect(bubble.bubbles).toEqual({});
    });

    test('creates container with jquery selector', () => {
      expect($).toHaveBeenCalledWith('#bubbles');
    });
  });

  describe('create', () => {
    test('creates a new bubble when id does not exist', () => {
      const result = bubble.create(1, 'Hello', 1000);
      expect(Blob).toHaveBeenCalled();
      expect(bubble.bubbles[1]).toBeDefined();
      expect(result).toBe(bubble.bubbles[1]);
    });

    test('returns existing bubble when id already exists', () => {
      const mockBlob = {
        id: 1,
        reset: jest.fn(),
        destroy: jest.fn(),
        isOver: jest.fn().mockReturnValue(false),
      };
      bubble.bubbles[1] = mockBlob;

      const result = bubble.create(1, 'Updated', 2000);
      expect(mockBlob.reset).toHaveBeenCalledWith(2000);
      expect(result).toBe(mockBlob);
    });

    test('updates message html for existing bubble', () => {
      const mockBlob = {
        id: 1,
        reset: jest.fn(),
        destroy: jest.fn(),
        isOver: jest.fn().mockReturnValue(false),
      };
      bubble.bubbles[1] = mockBlob;

      bubble.create(1, 'New message', 2000);
      expect(mockJqueryElement.html).toHaveBeenCalledWith('New message');
    });

    test('appends new bubble element to container', () => {
      bubble.create(42, 'Test message', 1000);
      expect(mockJqueryElement.appendTo).toHaveBeenCalled();
    });

    test('uses default duration of 5000 when not provided', () => {
      bubble.create(1, 'Hello', 1000);
      expect(Blob).toHaveBeenCalledWith(1, 1000, expect.anything(), undefined);
    });

    test('passes custom duration to Blob', () => {
      bubble.create(1, 'Hello', 1000, 3000);
      expect(Blob).toHaveBeenCalledWith(1, 1000, expect.anything(), 3000);
    });
  });

  describe('get', () => {
    test('returns bubble by id when it exists', () => {
      const mockBlob = { id: 1 };
      bubble.bubbles[1] = mockBlob;
      expect(bubble.get(1)).toBe(mockBlob);
    });

    test('returns null when bubble does not exist', () => {
      expect(bubble.get(999)).toBeNull();
    });
  });

  describe('setTo', () => {
    test('does nothing when bubble does not exist', () => {
      const entity = { id: 999, x: 100, y: 100 };
      // Should not throw
      expect(() => bubble.setTo(entity)).not.toThrow();
    });

    test('does nothing when bubble does not exist for entity id', () => {
      // No bubble registered for this entity - setTo returns early
      const entity = { id: 999, x: 50, y: 50 };
      expect(() => bubble.setTo(entity)).not.toThrow();
      // css should not be called since the bubble doesn't exist
      expect(mockJqueryElement.css).not.toHaveBeenCalled();
    });

    test('positions bubble element when entity and bubble exist', () => {
      const mockBlob = {
        id: 1,
        element: mockJqueryElement,
      };
      bubble.bubbles[1] = mockBlob;
      mockJqueryElement.css.mockReturnValue('200px');

      const entity = { id: 1, x: 100, y: 100 };
      bubble.setTo(entity);

      expect(mockGame.renderer.getDrawingScale).toHaveBeenCalled();
      expect(mockGame.getCamera).toHaveBeenCalled();
      expect(mockJqueryElement.css).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('calls setTo for entities that still exist', () => {
      const mockEntity = { id: 1, x: 50, y: 50 };
      mockGame.entities.get.mockReturnValue(mockEntity);

      const mockBlob = {
        id: 1,
        element: mockJqueryElement,
        isOver: jest.fn().mockReturnValue(false),
        destroy: jest.fn(),
      };
      bubble.bubbles[1] = mockBlob;

      const setToSpy = jest.spyOn(bubble, 'setTo');
      bubble.update(5000);

      expect(setToSpy).toHaveBeenCalledWith(mockEntity);
    });

    test('destroys bubbles that have expired', () => {
      const mockBlob = {
        id: 1,
        element: mockJqueryElement,
        isOver: jest.fn().mockReturnValue(true),
        destroy: jest.fn(),
      };
      bubble.bubbles[1] = mockBlob;

      bubble.update(99999);

      expect(mockBlob.destroy).toHaveBeenCalled();
      expect(bubble.bubbles[1]).toBeUndefined();
    });

    test('does not destroy bubbles that have not expired', () => {
      const mockBlob = {
        id: 1,
        element: mockJqueryElement,
        isOver: jest.fn().mockReturnValue(false),
        destroy: jest.fn(),
      };
      bubble.bubbles[1] = mockBlob;

      bubble.update(100);

      expect(mockBlob.destroy).not.toHaveBeenCalled();
      expect(bubble.bubbles[1]).toBeDefined();
    });
  });

  describe('clean', () => {
    test('destroys all bubbles and clears the bubbles object', () => {
      const mockBlob1 = { id: 1, destroy: jest.fn() };
      const mockBlob2 = { id: 2, destroy: jest.fn() };
      bubble.bubbles[1] = mockBlob1;
      bubble.bubbles[2] = mockBlob2;

      bubble.clean();

      expect(mockBlob1.destroy).toHaveBeenCalled();
      expect(mockBlob2.destroy).toHaveBeenCalled();
      expect(bubble.bubbles).toEqual({});
    });

    test('handles empty bubbles object without error', () => {
      expect(() => bubble.clean()).not.toThrow();
      expect(bubble.bubbles).toEqual({});
    });
  });

  describe('destroy', () => {
    test('destroys and removes a specific bubble by id', () => {
      const mockBlob = { id: 1, destroy: jest.fn() };
      bubble.bubbles[1] = mockBlob;

      bubble.destroy(1);

      expect(mockBlob.destroy).toHaveBeenCalled();
      expect(bubble.bubbles[1]).toBeUndefined();
    });

    test('does nothing when bubble id does not exist', () => {
      // Should not throw
      expect(() => bubble.destroy(999)).not.toThrow();
    });
  });
});
