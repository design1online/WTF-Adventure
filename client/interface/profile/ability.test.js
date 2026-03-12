import Ability from './ability';
import GamePage from './gamePage';

jest.mock('jquery', () => {
  const mockBody = {
    fadeIn: jest.fn(),
    fadeOut: jest.fn(),
    css: jest.fn(() => 'none'),
  };
  return jest.fn(() => mockBody);
});

describe('Ability', () => {
  test('extends GamePage', () => {
    const game = {};
    const ability = new Ability(game);
    expect(ability).toBeInstanceOf(GamePage);
  });

  test('constructor stores game reference', () => {
    const game = { test: true };
    const ability = new Ability(game);
    expect(ability.game).toBe(game);
  });

  test('inherits isVisible from GamePage', () => {
    const ability = new Ability({});
    expect(typeof ability.isVisible).toBe('function');
  });

  test('inherits getImageFormat from GamePage', () => {
    const ability = new Ability({});
    expect(ability.getImageFormat(2, 'shield')).toBe('url("/img/2/item-shield.png")');
  });
});
