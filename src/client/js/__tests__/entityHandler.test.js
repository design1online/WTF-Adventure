import EntityHandler from '../entity/entityhandler';

describe('EntityHandler', () => {
  let entity;
  let handler;

  beforeEach(() => {
    entity = {
      id: 123,
      type: 'player',
      gridX: 1,
      gridY: 1,
      hasTarget: jest.fn(),
      getDistance: jest.fn(),
      stop: jest.fn(),
      onRequestPath: jest.fn(),
      onBeforeStep: jest.fn(),
      onStep: jest.fn(),
      onStopPathing: jest.fn(),
      forEachAttacker: jest.fn(),
    };
    handler = new EntityHandler(entity);
  });

  describe('constructor', () => {
    it('should set the entity property', () => {
      expect(handler.entity).toBe(entity);
    });

    it('should set the game property to null', () => {
      expect(handler.game).toBeNull();
    });

    it('should set the entities property to null', () => {
      expect(handler.entities).toBeNull();
    });
  });

  describe('load', () => {
    it('should return false if no entity or game', () => {
      expect(handler.load()).toBe(false);
    });

    it('should return true if entity and game are set', () => {
      handler.game = {};
      expect(handler.load()).toBe(true);
    });
  });
});
