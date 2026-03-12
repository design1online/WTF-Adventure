import Inventory from './inventory';

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

jest.mock('./container/container', () => {
  return jest.fn().mockImplementation((size) => ({
    size,
    slots: Array.from({ length: size }, (_, i) => ({
      index: i,
      name: null,
      count: 0,
      edible: false,
      equippable: false,
      isEmpty: jest.fn().mockReturnValue(true),
      empty: jest.fn(),
      loadSlot: jest.fn(),
      setCount: jest.fn(),
    })),
    setSlot: jest.fn(),
    getImageFormat: jest.fn().mockReturnValue('url("/img/2/item-sword.png")'),
  }));
});

jest.mock('../network/packets', () => ({
  Inventory: 22,
  InventoryOpcode: { Select: 0, Remove: 1 },
}));

describe('Inventory', () => {
  let inventory;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      interface: {
        actions: {
          reset: jest.fn(),
          loadDefaults: jest.fn(),
          add: jest.fn(),
          isVisible: jest.fn().mockReturnValue(false),
          show: jest.fn(),
          hide: jest.fn(),
          hideDrop: jest.fn(),
          displayDrop: jest.fn(),
        },
        hideAll: jest.fn(),
      },
      socket: { send: jest.fn() },
      renderer: { getDrawingScale: jest.fn().mockReturnValue(2) },
      client: { isMobile: jest.fn().mockReturnValue(false) },
    };
    inventory = new Inventory(mockGame, 5);
  });

  test('constructor stores game reference', () => {
    expect(inventory.game).toBe(mockGame);
  });

  test('constructor sets activeClass to inventory', () => {
    expect(inventory.activeClass).toBe('inventory');
  });

  test('constructor creates container with given size', () => {
    expect(inventory.container).toBeDefined();
    expect(inventory.container.size).toBe(5);
  });

  test('constructor initializes selectedSlot to null', () => {
    expect(inventory.selectedSlot).toBeNull();
  });

  test('constructor initializes selectedItem to null', () => {
    expect(inventory.selectedItem).toBeNull();
  });

  test('display() calls fadeIn on body', () => {
    inventory.display();
    expect(inventory.body.fadeIn).toHaveBeenCalledWith('fast');
  });

  test('hide() calls fadeOut on body', () => {
    inventory.hide();
    expect(inventory.body.fadeOut).toHaveBeenCalledWith('slow');
  });

  test('getSize() returns container size', () => {
    expect(inventory.getSize()).toBe(5);
  });

  test('getScale() returns renderer drawing scale', () => {
    expect(inventory.getScale()).toBe(2);
  });

  test('clearSelection() resets selectedSlot and selectedItem', () => {
    inventory.selectedSlot = { removeClass: jest.fn() };
    inventory.selectedItem = {};
    inventory.clearSelection();
    expect(inventory.selectedSlot).toBeNull();
    expect(inventory.selectedItem).toBeNull();
  });

  test('clickAction() does nothing when no selectedSlot', () => {
    inventory.selectedSlot = null;
    inventory.selectedItem = null;
    expect(() => inventory.clickAction('eat')).not.toThrow();
  });
});
