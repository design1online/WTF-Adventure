import Profile from './profile';

// Shared jQuery mock element factory
const makeMockEl = () => ({
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
});

jest.mock('jquery', () => {
  const $ = jest.fn(() => makeMockEl());
  $.fn = makeMockEl();
  return $;
});

jest.mock('underscore', () => ({
  each: jest.fn((collection, fn) => {
    if (Array.isArray(collection)) collection.forEach(fn);
  }),
}));

// Mock all profile sub-pages
const mockPageFactory = () => ({
  update: jest.fn(),
  resize: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  isVisible: jest.fn().mockReturnValue(false),
  loadPage: jest.fn(),
  loaded: false,
});

jest.mock('./state', () => jest.fn().mockImplementation(() => mockPageFactory()));
jest.mock('./ability', () => jest.fn().mockImplementation(() => mockPageFactory()));
jest.mock('./settings', () => jest.fn().mockImplementation(() => mockPageFactory()));
jest.mock('./quest', () => jest.fn().mockImplementation(() => mockPageFactory()));

jest.mock('../../network/packets', () => ({
  Click: 99,
}));

describe('Profile', () => {
  let profile;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      interface: { hideAll: jest.fn() },
      socket: { send: jest.fn() },
      getScaleFactor: jest.fn().mockReturnValue(2),
    };
    profile = new Profile(mockGame);
  });

  test('constructor stores game reference', () => {
    expect(profile.game).toBe(mockGame);
  });

  test('constructor initializes activeIndex to 0', () => {
    expect(profile.activeIndex).toBe(0);
  });

  test('constructor populates pages array', () => {
    expect(profile.pages.length).toBeGreaterThan(0);
  });

  test('constructor sets activePage', () => {
    expect(profile.activePage).toBeDefined();
  });

  test('show() calls fadeIn on body', () => {
    profile.show();
    expect(profile.body.fadeIn).toHaveBeenCalledWith('slow');
  });

  test('hide() calls fadeOut on body', () => {
    profile.hide();
    expect(profile.body.fadeOut).toHaveBeenCalledWith('fast');
  });

  test('clear() calls hide on activePage', () => {
    profile.clear();
    expect(profile.activePage.hide).toHaveBeenCalled();
  });

  test('update() calls update on all pages', () => {
    profile.update();
    profile.pages.forEach((page) => {
      expect(page.update).toHaveBeenCalled();
    });
  });

  test('resize() calls resize on all pages', () => {
    profile.resize();
    profile.pages.forEach((page) => {
      expect(page.resize).toHaveBeenCalled();
    });
  });

  test('getScale() returns game scale factor', () => {
    expect(profile.getScale()).toBe(2);
  });

  test('setPage() updates activeIndex', () => {
    profile.setPage(1);
    expect(profile.activeIndex).toBe(1);
  });
});
