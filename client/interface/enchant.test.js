import Enchant from './enchant';

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

jest.mock('../network/packets', () => ({
  Enchant: 35,
  EnchantOpcode: { Enchant: 0, Select: 1, Remove: 2 },
}));

describe('Enchant', () => {
  let enchant;
  let mockGame;
  let mockInterface;

  beforeEach(() => {
    mockGame = {
      socket: { send: jest.fn() },
    };
    mockInterface = {
      bank: {
        getInventoryList: jest.fn().mockReturnValue([]),
      },
      inventory: {
        getSize: jest.fn().mockReturnValue(3),
        container: {
          slots: [
            { name: 'sword', count: 1 },
            { name: null, count: 0 },
            { name: null, count: 0 },
          ],
        },
      },
    };
    enchant = new Enchant(mockGame, mockInterface);
  });

  test('constructor stores game reference', () => {
    expect(enchant.game).toBe(mockGame);
  });

  test('constructor stores interface reference', () => {
    expect(enchant.interface).toBe(mockInterface);
  });

  test('display() calls fadeIn on body', () => {
    enchant.display();
    expect(enchant.body.fadeIn).toHaveBeenCalledWith('fast');
  });

  test('hide() calls fadeOut on body', () => {
    enchant.hide();
    expect(enchant.body.fadeOut).toHaveBeenCalledWith('fast');
  });

  test('enchant() sends enchant packet', () => {
    enchant.enchant();
    expect(mockGame.socket.send).toHaveBeenCalled();
  });

  test('remove() sends remove packet', () => {
    enchant.remove('item');
    expect(mockGame.socket.send).toHaveBeenCalled();
  });

  test('getInventorySize() delegates to interface.inventory', () => {
    expect(enchant.getInventorySize()).toBe(3);
  });

  test('getItemSlot() returns slot from inventory container', () => {
    const slot = enchant.getItemSlot(0);
    expect(slot.name).toBe('sword');
  });

  test('hasImage() returns false when no background-image', () => {
    const $ = require('jquery');
    const img = $('<div></div>');
    img.css = jest.fn().mockReturnValue('none');
    expect(enchant.hasImage(img)).toBe(false);
  });

  test('getSlots() returns enchantSlots list', () => {
    const result = enchant.getSlots();
    expect(result).toBeDefined();
  });
});
