import PlayerHandler from './playerhandler';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../network/packets', () => ({
  __esModule: true,
  default: {
    Movement: 9,
    Target: 13,
    MovementOpcode: {
      Request: 0,
      Started: 1,
      Step: 2,
      Stop: 3,
    },
    TargetOpcode: {
      None: 0,
      Attack: 1,
      Talk: 2,
    },
  },
}));

const makePlayer = () => {
  const callbacks = {};
  return {
    dead: false,
    gridX: 5,
    gridY: 5,
    target: null,
    hasTarget: jest.fn(() => !!makePlayer._target),
    hasNextStep: jest.fn(() => false),
    isRanged: jest.fn(() => false),
    getDistance: jest.fn(() => 10),
    stop: jest.fn(),
    follow: jest.fn(),
    lookAt: jest.fn(),
    forEachAttacker: jest.fn(),
    setSprite: jest.fn(),
    onRequestPath: jest.fn((cb) => { callbacks.requestPath = cb; }),
    onStartPathing: jest.fn((cb) => { callbacks.startPathing = cb; }),
    onStopPathing: jest.fn((cb) => { callbacks.stopPathing = cb; }),
    onBeforeStep: jest.fn((cb) => { callbacks.beforeStep = cb; }),
    onStep: jest.fn((cb) => { callbacks.step = cb; }),
    onSecondStep: jest.fn((cb) => { callbacks.secondStep = cb; }),
    onMove: jest.fn((cb) => { callbacks.move = cb; }),
    onUpdateArmour: jest.fn((cb) => { callbacks.updateArmour = cb; }),
    _callbacks: callbacks,
  };
};

const makeGame = (player) => ({
  getCamera: jest.fn(() => ({
    centreOn: jest.fn(),
    clip: jest.fn(),
    zone: jest.fn(),
    centered: true,
    gridX: 0,
    gridY: 0,
    gridWidth: 20,
    gridHeight: 20,
  })),
  input: {
    selectedX: 0,
    selectedY: 0,
    selectedCellVisible: false,
    setPassiveTarget: jest.fn(),
  },
  entities: {
    registerPosition: jest.fn(),
    unregisterPosition: jest.fn(),
    registerDuality: jest.fn(),
  },
  socket: {
    send: jest.fn(),
  },
  renderer: {
    updateAnimatedTiles: jest.fn(),
  },
  findPath: jest.fn(() => [[5, 5], [6, 5]]),
  getEntityAt: jest.fn(() => null),
  getSprite: jest.fn(() => 'sprite'),
  zoning: {
    setLeft: jest.fn(),
    setUp: jest.fn(),
    setRight: jest.fn(),
    setDown: jest.fn(),
    getDirection: jest.fn(),
    direction: null,
    reset: jest.fn(),
  },
});

describe('PlayerHandler', () => {
  let player;
  let game;
  let handler;

  beforeEach(() => {
    jest.clearAllMocks();
    player = makePlayer();
    game = makeGame(player);
    handler = new PlayerHandler(game, player);
  });

  describe('constructor', () => {
    it('stores game references', () => {
      expect(handler.game).toBe(game);
      expect(handler.player).toBe(player);
      expect(handler.socket).toBe(game.socket);
      expect(handler.renderer).toBe(game.renderer);
    });

    it('retrieves the camera from game', () => {
      expect(game.getCamera).toHaveBeenCalled();
      expect(handler.camera).toBeDefined();
    });
  });

  describe('loadPlayerHandler()', () => {
    it('registers all required player callbacks', () => {
      expect(player.onRequestPath).toHaveBeenCalled();
      expect(player.onStartPathing).toHaveBeenCalled();
      expect(player.onStopPathing).toHaveBeenCalled();
      expect(player.onBeforeStep).toHaveBeenCalled();
      expect(player.onStep).toHaveBeenCalled();
      expect(player.onSecondStep).toHaveBeenCalled();
      expect(player.onMove).toHaveBeenCalled();
      expect(player.onUpdateArmour).toHaveBeenCalled();
    });
  });

  describe('onRequestPath callback', () => {
    it('returns null when player is dead', () => {
      player.dead = true;
      const cb = player._callbacks.requestPath;
      expect(cb(3, 4)).toBeNull();
    });

    it('calls game.findPath and sends a Movement packet', () => {
      player.dead = false;
      player.hasTarget = jest.fn(() => false);
      const cb = player._callbacks.requestPath;
      const result = cb(3, 4);
      expect(game.socket.send).toHaveBeenCalled();
      expect(game.findPath).toHaveBeenCalled();
      expect(result).toEqual([[5, 5], [6, 5]]);
    });
  });

  describe('isAttackable()', () => {
    it('returns false when there is no target', () => {
      player.target = null;
      expect(handler.isAttackable()).toBe(false);
    });

    it('returns true for a mob target', () => {
      player.target = { type: 'mob' };
      expect(handler.isAttackable()).toBe(true);
    });

    it('returns true for a pvp player target', () => {
      player.target = { type: 'player', pvp: true };
      expect(handler.isAttackable()).toBe(true);
    });

    it('returns false for a non-pvp player target', () => {
      player.target = { type: 'player', pvp: false };
      expect(handler.isAttackable()).toBe(false);
    });
  });
});
