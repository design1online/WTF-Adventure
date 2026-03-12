jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

import Updater from './updater';

function makeGame() {
  const camera = { forEachVisiblePosition: jest.fn() };
  return {
    time: 0,
    pvp: false,
    overlayScale: 1,
    getCamera: jest.fn().mockReturnValue(camera),
    entities: {
      grids: {
        renderingGrid: [],
        entityGrid: [],
      },
      get: jest.fn(),
    },
    renderer: {
      camera,
      tileSize: 16,
      getDrawingScale: jest.fn().mockReturnValue(2),
    },
    input: {
      targetVisible: true,
      selectedCellVisible: true,
      cursorMoved: false,
      mouse: { x: 0, y: 0 },
    },
    socket: { send: jest.fn() },
    audio: { update: jest.fn() },
    info: { update: jest.fn() },
    bubble: { update: jest.fn() },
    pointer: { update: jest.fn() },
    overlays: {},
  };
}

describe('Updater', () => {
  test('constructor stores game and renderer references', () => {
    const game = makeGame();
    const updater = new Updater(game);
    expect(updater.game).toBe(game);
    expect(updater.renderer).toBe(game.renderer);
  });

  test('constructor is defined', () => {
    const game = makeGame();
    const updater = new Updater(game);
    expect(updater).toBeDefined();
  });
});
