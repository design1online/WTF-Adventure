import Bank from './bank';

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
      isEmpty: jest.fn().mockReturnValue(true),
      empty: jest.fn(),
      loadSlot: jest.fn(),
      setCount: jest.fn(),
    })),
    setSlot: jest.fn(),
    getImageFormat: jest.fn().mockReturnValue('url("/img/1/item-sword.png")'),
  }));
});

jest.mock('../network/packets', () => ({
  Bank: 23,
  BankOpcode: { Select: 0 },
}));

describe('Bank', () => {
  let bank;
  let mockGame;
  let mockInventoryContainer;

  beforeEach(() => {
    mockGame = {
      player: {},
      socket: { send: jest.fn() },
      renderer: { getDrawingScale: jest.fn().mockReturnValue(2) },
      getScaleFactor: jest.fn().mockReturnValue(2),
      client: { isMobile: jest.fn().mockReturnValue(false) },
    };
    mockInventoryContainer = {
      size: 3,
      slots: [
        { name: null, count: 0 },
        { name: null, count: 0 },
        { name: null, count: 0 },
      ],
    };
    bank = new Bank(mockGame, mockInventoryContainer, 5);
  });

  test('constructor stores game reference', () => {
    expect(bank.game).toBe(mockGame);
  });

  test('constructor stores inventoryContainer reference', () => {
    expect(bank.inventoryContainer).toBe(mockInventoryContainer);
  });

  test('constructor stores player reference', () => {
    expect(bank.player).toBe(mockGame.player);
  });

  test('constructor creates container with given size', () => {
    expect(bank.container).toBeDefined();
    expect(bank.container.size).toBe(5);
  });

  test('display() calls fadeIn on body', () => {
    bank.display();
    expect(bank.body.fadeIn).toHaveBeenCalledWith('slow');
  });

  test('hide() calls fadeOut on body', () => {
    bank.hide();
    expect(bank.body.fadeOut).toHaveBeenCalledWith('fast');
  });

  test('getDrawingScale() returns renderer drawing scale', () => {
    expect(bank.getDrawingScale()).toBe(2);
  });

  test('getScale() returns game scale factor', () => {
    expect(bank.getScale()).toBe(2);
  });

  test('getBankList() calls find on bankSlots', () => {
    const result = bank.getBankList();
    expect(result).toBeDefined();
  });

  test('getInventoryList() calls find on bankInventorySlots', () => {
    const result = bank.getInventoryList();
    expect(result).toBeDefined();
  });
});
