import GamePage from './gamePage';

// Mock jQuery
jest.mock('jquery', () => {
  const mockBody = {
    fadeIn: jest.fn(),
    fadeOut: jest.fn(),
    css: jest.fn(() => 'block'),
  };
  return jest.fn(() => mockBody);
});

describe('GamePage', () => {
  let page;

  beforeEach(() => {
    page = new GamePage('#testPage');
  });

  test('constructor sets loaded to false', () => {
    expect(page.loaded).toBe(false);
    expect(page.body).toBeDefined();
  });

  test('show() calls fadeIn on body', () => {
    page.show();
    expect(page.body.fadeIn).toHaveBeenCalledWith('slow');
  });

  test('hide() calls fadeOut on body', () => {
    page.hide();
    expect(page.body.fadeOut).toHaveBeenCalledWith('slow');
  });

  test('isVisible() returns true when display is block', () => {
    expect(page.isVisible()).toBe(true);
  });

  test('getImageFormat() returns empty string for null', () => {
    expect(page.getImageFormat(2, null)).toBe('');
    expect(page.getImageFormat(2, 'null')).toBe('');
  });

  test('getImageFormat() returns CSS url for valid name', () => {
    expect(page.getImageFormat(2, 'sword')).toBe('url("/img/2/item-sword.png")');
  });
});
