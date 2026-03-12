import EntityHandler from './entityhandler';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../network/packets', () => ({
  Movement: 9,
  MovementOpcode: { Entity: 6 },
}), { virtual: true });

describe('EntityHandler', () => {
  let handler;
  let mockEntity;

  beforeEach(() => {
    mockEntity = { id: 1, type: 'player' };
    handler = new EntityHandler(mockEntity);
  });

  test('constructor stores entity', () => {
    expect(handler.entity).toBe(mockEntity);
    expect(handler.game).toBeNull();
    expect(handler.entities).toBeNull();
  });

  test('load() returns false if no entity', () => {
    handler.entity = null;
    expect(handler.load()).toBe(false);
  });

  test('load() returns false if no game', () => {
    handler.game = null;
    expect(handler.load()).toBe(false);
  });

  test('load() returns true for non-character type', () => {
    handler.game = {};
    mockEntity.type = 'item'; // not a character
    expect(handler.load()).toBe(true);
  });

  test('isCharacter() returns true for player type', () => {
    mockEntity.type = 'player';
    expect(handler.isCharacter()).toBe(true);
  });

  test('isCharacter() returns true for mob type', () => {
    mockEntity.type = 'mob';
    expect(handler.isCharacter()).toBe(true);
  });

  test('isCharacter() returns true for npc type', () => {
    mockEntity.type = 'npc';
    expect(handler.isCharacter()).toBe(true);
  });

  test('isCharacter() returns false for item type', () => {
    mockEntity.type = 'item';
    expect(handler.isCharacter()).toBe(false);
  });

  test('isCharacter() returns falsy when no type', () => {
    mockEntity.type = undefined;
    expect(handler.isCharacter()).toBeFalsy();
  });

  test('setGame() sets game and entities', () => {
    const mockEntities = {};
    const mockGame = { entities: mockEntities };
    handler.setGame(mockGame);
    expect(handler.game).toBe(mockGame);
    expect(handler.entities).toBe(mockEntities);
  });

  test('setGame() does not override existing game', () => {
    const game1 = { entities: {} };
    const game2 = { entities: {} };
    handler.setGame(game1);
    handler.setGame(game2);
    expect(handler.game).toBe(game1);
  });

  test('setEntities() sets entities', () => {
    const entities = { test: true };
    handler.setEntities(entities);
    expect(handler.entities).toBe(entities);
  });

  test('setEntities() does not override existing entities', () => {
    const e1 = { id: 1 };
    const e2 = { id: 2 };
    handler.setEntities(e1);
    handler.setEntities(e2);
    expect(handler.entities).toBe(e1);
  });
});
