import State from './state';

jest.mock('jquery', () => {
  const mockEl = {
    find: jest.fn().mockReturnThis(),
    css: jest.fn().mockReturnThis(),
    click: jest.fn().mockReturnThis(),
    fadeIn: jest.fn().mockReturnThis(),
    fadeOut: jest.fn().mockReturnThis(),
    prepend: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    val: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    removeClass: jest.fn().mockReturnThis(),
    addClass: jest.fn().mockReturnThis(),
    hasClass: jest.fn().mockReturnValue(false),
    on: jest.fn().mockReturnThis(),
    change: jest.fn().mockReturnThis(),
    blur: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    focus: jest.fn().mockReturnThis(),
    empty: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    toggleClass: jest.fn().mockReturnThis(),
    dblclick: jest.fn().mockReturnThis(),
    width: jest.fn().mockReturnValue(100),
    height: jest.fn().mockReturnValue(100),
    remove: jest.fn().mockReturnThis(),
    length: 0,
  };
  const $ = jest.fn(() => mockEl);
  $.fn = mockEl;
  return $;
});

jest.mock('underscore', () => ({
  each: jest.fn((collection, fn) => {
    if (Array.isArray(collection)) collection.forEach(fn);
  }),
}));

jest.mock('../../network/packets', () => ({
  Equipment: 6,
  EquipmentOpcode: { Unequip: 1 },
}));

describe('State', () => {
  let state;
  let mockGame;

  const makeEquipment = (name) => ({ name });

  beforeEach(() => {
    mockGame = {
      player: {
        username: 'TestPlayer',
        level: 10,
        experience: 500,
        armour: makeEquipment('leather'),
        weapon: makeEquipment('sword'),
        pendant: makeEquipment('pendant'),
        ring: makeEquipment('ring'),
        boots: makeEquipment('boots'),
      },
      socket: { send: jest.fn() },
      renderer: { getDrawingScale: jest.fn().mockReturnValue(2) },
      getScaleFactor: jest.fn().mockReturnValue(2),
    };
    state = new State(mockGame);
  });

  test('constructor stores game reference', () => {
    expect(state.game).toBe(mockGame);
  });

  test('constructor stores player reference', () => {
    expect(state.player).toBe(mockGame.player);
  });

  test('constructor sets loaded to true when player has armour', () => {
    expect(state.loaded).toBe(true);
  });

  test('constructor initializes slots array with 5 entries', () => {
    expect(state.slots.length).toBe(5);
  });

  test('getScale() returns renderer drawing scale', () => {
    expect(state.getScale()).toBe(2);
  });

  test('update() calls text on level and experience elements', () => {
    state.update();
    expect(state.level.text).toHaveBeenCalledWith(mockGame.player.level);
    expect(state.experience.text).toHaveBeenCalledWith(mockGame.player.experience);
  });

  test('resize() calls loadStateSlots without throwing', () => {
    expect(() => state.resize()).not.toThrow();
  });

  test('forEachSlot() calls callback for each slot', () => {
    const cb = jest.fn();
    state.forEachSlot(cb);
    expect(cb).toHaveBeenCalledTimes(5);
  });

  test('loaded is false when player has no armour', () => {
    mockGame.player.armour = null;
    const stateNoArmour = new State(mockGame);
    expect(stateNoArmour.loaded).toBe(false);
  });
});
