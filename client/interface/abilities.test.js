import Abilities from './abilities';

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
    length: 0,
  };
  const $ = jest.fn(() => mockEl);
  $.fn = mockEl;
  return $;
});

describe('Abilities', () => {
  let abilities;
  let mockGame;

  beforeEach(() => {
    mockGame = {};
    abilities = new Abilities(mockGame);
  });

  test('constructor stores the game reference', () => {
    expect(abilities.game).toBe(mockGame);
  });

  test('constructor initializes shortcuts element', () => {
    expect(abilities.shortcuts).toBeDefined();
  });

  test('getList() calls find on shortcuts', () => {
    const result = abilities.getList();
    expect(result).toBeDefined();
  });
});
