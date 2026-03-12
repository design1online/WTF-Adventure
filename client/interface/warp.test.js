import Warp from './warp';

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
  Warp: 40,
}));

describe('Warp', () => {
  let warp;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      socket: { send: jest.fn() },
      getScaleFactor: jest.fn().mockReturnValue(2),
    };
    warp = new Warp(mockGame);
  });

  test('constructor stores game reference', () => {
    expect(warp.game).toBe(mockGame);
  });

  test('constructor initializes warpCount to 0', () => {
    expect(warp.warpCount).toBe(0);
  });

  test('display() calls fadeIn on mapFrame', () => {
    warp.display();
    expect(warp.mapFrame.fadeIn).toHaveBeenCalledWith('slow');
  });

  test('hide() calls fadeOut on mapFrame', () => {
    warp.hide();
    expect(warp.mapFrame.fadeOut).toHaveBeenCalledWith('fast');
  });

  test('getScale() returns game scale factor', () => {
    expect(warp.getScale()).toBe(2);
  });

  test('toggle() calls display() when not visible', () => {
    warp.mapFrame.css = jest.fn().mockReturnValue('none');
    const displaySpy = jest.spyOn(warp, 'display');
    warp.toggle();
    expect(displaySpy).toHaveBeenCalled();
  });

  test('toggle() calls hide() when visible', () => {
    warp.mapFrame.css = jest.fn().mockReturnValue('block');
    const hideSpy = jest.spyOn(warp, 'hide');
    warp.toggle();
    expect(hideSpy).toHaveBeenCalled();
  });
});
