import Actions from './actions';

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
    val: jest.fn().mockReturnValue(''),
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

describe('Actions', () => {
  let actions;
  let mockInterface;

  beforeEach(() => {
    mockInterface = {
      game: { player: {} },
      inventory: { clickAction: jest.fn() },
    };
    actions = new Actions(mockInterface);
  });

  test('constructor stores interface reference', () => {
    expect(actions.interface).toBe(mockInterface);
  });

  test('constructor initializes activeClass to null', () => {
    expect(actions.activeClass).toBeNull();
  });

  test('constructor initializes miscButton to null', () => {
    expect(actions.miscButton).toBeNull();
  });

  test('loadDefaults() sets activeClass', () => {
    actions.loadDefaults('inventory');
    expect(actions.activeClass).toBe('inventory');
  });

  test('loadDefaults() with profile does not throw', () => {
    expect(() => actions.loadDefaults('profile')).not.toThrow();
  });

  test('show() calls fadeIn on body', () => {
    actions.show();
    expect(actions.body.fadeIn).toHaveBeenCalledWith('fast');
  });

  test('hide() calls fadeOut on body', () => {
    actions.hide();
    expect(actions.body.fadeOut).toHaveBeenCalledWith('slow');
  });

  test('hidePlayerActions() calls fadeOut on pBody', () => {
    actions.hidePlayerActions();
    expect(actions.pBody.fadeOut).toHaveBeenCalledWith('fast');
  });

  test('hideDrop() calls fadeOut on drop', () => {
    actions.hideDrop();
    expect(actions.drop.fadeOut).toHaveBeenCalledWith('slow');
  });

  test('getGame() returns interface.game', () => {
    expect(actions.getGame()).toBe(mockInterface.game);
  });

  test('getPlayer() returns interface.game.player', () => {
    expect(actions.getPlayer()).toBe(mockInterface.game.player);
  });

  test('reset() does not throw', () => {
    expect(() => actions.reset()).not.toThrow();
  });

  test('add() sets miscButton when misc is true', () => {
    const $ = require('jquery');
    const btn = $('<div></div>');
    actions.add(btn, true);
    expect(actions.miscButton).toBe(btn);
  });
});
