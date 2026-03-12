// Mock all imports before importing the module under test

jest.mock('./lib/log', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('./renderer/renderer', () => {
  return jest.fn().mockImplementation(() => ({
    camera: { setPlayer: jest.fn(), centered: false },
    renderedFrame: [0, 0],
    resize: jest.fn(),
    render: jest.fn(),
    setMap: jest.fn(),
    setEntities: jest.fn(),
    setInput: jest.fn(),
    loadCamera: jest.fn(),
    loadStaticSprites: jest.fn(),
    updateAnimatedTiles: jest.fn(),
    verifyCentration: jest.fn(),
    stop: jest.fn(),
  }));
});

jest.mock('./utils/storage', () => {
  return jest.fn().mockImplementation(() => ({
    data: {
      new: false,
      welcome: false,
      settings: { centerCamera: true },
      player: { rememberMe: false, username: '', password: '' },
    },
    save: jest.fn(),
    get: jest.fn(),
  }));
});

jest.mock('./map/map', () => {
  return jest.fn().mockImplementation(() => ({
    ready: false,
    width: 100,
    height: 100,
    onReady: jest.fn(),
    loadMap: jest.fn(),
    updateTileset: jest.fn(),
  }));
});

jest.mock('./network/socket', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { handleData: jest.fn() },
    send: jest.fn(),
    connect: jest.fn(),
  }));
});

jest.mock('./entity/character/player/player', () => {
  return jest.fn().mockImplementation(() => ({
    id: 1,
    type: 'player',
    gridX: 0,
    gridY: 0,
    x: 0,
    y: 0,
    getSpriteName: jest.fn().mockReturnValue('clotharmour'),
    setSprite: jest.fn(),
    idle: jest.fn(),
    fadeIn: jest.fn(),
    setGridPosition: jest.fn(),
  }));
});

jest.mock('./renderer/updater', () => {
  return jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    setSprites: jest.fn(),
  }));
});

jest.mock('./controllers/entities', () => {
  return jest.fn().mockImplementation(() => ({
    grids: {
      renderingGrid: [],
      entityGrid: [],
      itemGrid: [],
    },
    get: jest.fn().mockReturnValue(null),
    loadEntities: jest.fn(),
    addEntity: jest.fn(),
    getSprite: jest.fn().mockReturnValue(null),
    update: jest.fn(),
    sprites: {},
  }));
});

jest.mock('./controllers/input', () => {
  return jest.fn().mockImplementation(() => ({
    loadCursors: jest.fn(),
    mouse: { x: 0, y: 0 },
  }));
});

jest.mock('./entity/character/player/playerhandler', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('./utils/pathfinder', () => {
  return jest.fn().mockImplementation(() => ({
    findPath: jest.fn().mockReturnValue([]),
  }));
});

jest.mock('./controllers/zoning', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('./controllers/info', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    update: jest.fn(),
    getCount: jest.fn().mockReturnValue(0),
  }));
});

jest.mock('./controllers/bubble', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    update: jest.fn(),
  }));
});

jest.mock('./controllers/interface', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn(),
    update: jest.fn(),
  }));
});

jest.mock('./controllers/audio', () => {
  return jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    stop: jest.fn(),
    play: jest.fn(),
  }));
});

jest.mock('./controllers/pointer', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn(),
    update: jest.fn(),
  }));
});

jest.mock('./utils/modules', () => ({
  __esModule: true,
  default: {
    Orientation: { Up: 0, Down: 1, Left: 2, Right: 3 },
    Types: { Player: 0 },
    InputType: { Key: 0, LeftClick: 1 },
    Actions: { Idle: 0, Attack: 1, Walk: 2 },
    Hits: { Damage: 0, Poison: 1, Heal: 2, Mana: 3, Experience: 4, LevelUp: 5, Critical: 6, Stun: 7, Explosive: 8 },
    AudioTypes: { Music: 0, SFX: 1 },
    Equipment: { Armour: 0, Weapon: 1, Pendant: 2, Ring: 3, Boots: 4 },
  },
}));

jest.mock('./network/packets', () => ({
  __esModule: true,
  default: {
    Ready: 'ready',
    Trade: 'trade',
    TradeOpcode: { Request: 'request' },
    Projectile: 'projectile',
    ProjectileOpcode: { Impact: 'impact' },
  },
}));

jest.mock('./utils/detect', () => ({
  __esModule: true,
  default: {
    isFirefox: jest.fn().mockReturnValue(false),
    isMobile: jest.fn().mockReturnValue(false),
    isTablet: jest.fn().mockReturnValue(false),
    androidVersion: jest.fn().mockReturnValue('10'),
    iOSVersion: jest.fn().mockReturnValue('14'),
    isIpad: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('./utils/util', () => ({
  requestAnimFrame: jest.fn(),
  isIntersecting: jest.fn().mockReturnValue(false),
}));

import Game from './game';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeClient() {
  return {
    isMobile: jest.fn().mockReturnValue(false),
    isTablet: jest.fn().mockReturnValue(false),
    getScaleFactor: jest.fn().mockReturnValue(2),
    sendStatus: jest.fn(),
    hasWorker: jest.fn().mockReturnValue(false),
    fadeMenu: jest.fn(),
    body: { addClass: jest.fn() },
  };
}

function makeJQueryMock() {
  const jq = jest.fn((selector) => ({
    prop: jest.fn().mockReturnThis(),
    val: jest.fn().mockReturnValue(''),
    width: jest.fn().mockReturnValue(800),
    height: jest.fn().mockReturnValue(600),
    addClass: jest.fn(),
    removeClass: jest.fn(),
  }));
  return jq;
}

// Mock DOM elements so loadRenderer() can call document.getElementById
beforeEach(() => {
  ['background', 'foreground', 'textCanvas', 'entities', 'cursor'].forEach((id) => {
    const el = document.createElement('canvas');
    el.id = id;
    document.body.appendChild(el);
  });

  global.$ = makeJQueryMock();
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Game', () => {
  describe('constructor', () => {
    test('stores client reference', () => {
      const client = makeClient();
      const game = new Game(client);
      expect(game.client).toBe(client);
    });

    test('initializes id to -1', () => {
      const game = new Game(makeClient());
      expect(game.id).toBe(-1);
    });

    test('initializes started to false', () => {
      const game = new Game(makeClient());
      expect(game.started).toBe(false);
    });

    test('initializes ready to false', () => {
      const game = new Game(makeClient());
      expect(game.ready).toBe(false);
    });

    test('loaded is true after construction when no worker (offline mode)', () => {
      // hasWorker() returns false in mock, so loadControllers sets loaded=true
      const client = makeClient();
      client.hasWorker.mockReturnValue(false);
      const game = new Game(client);
      expect(game.loaded).toBe(true);
    });

    test('initializes pvp to false', () => {
      const game = new Game(makeClient());
      expect(game.pvp).toBe(false);
    });

    test('initializes population to -1', () => {
      const game = new Game(makeClient());
      expect(game.population).toBe(-1);
    });

    test('calls loadRenderer during construction - renderer is set', () => {
      const game = new Game(makeClient());
      expect(game.renderer).not.toBeNull();
    });

    test('calls loadControllers during construction - audio is set', () => {
      const game = new Game(makeClient());
      expect(game.audio).not.toBeNull();
    });

    test('time is a Date instance', () => {
      const game = new Game(makeClient());
      expect(game.time).toBeInstanceOf(Date);
    });

    test('socket is created during construction', () => {
      const game = new Game(makeClient());
      expect(game.socket).not.toBeNull();
    });
  });

  describe('start()', () => {
    test('returns false when game is already started', () => {
      const game = new Game(makeClient());
      game.started = true;
      expect(game.start()).toBe(false);
    });

    test('sets started to true', () => {
      const game = new Game(makeClient());
      game.ready = false; // prevents tick() from cascading into render
      game.start();
      expect(game.started).toBe(true);
    });

    test('calls client.fadeMenu', () => {
      const client = makeClient();
      const game = new Game(client);
      game.ready = false;
      game.start();
      expect(client.fadeMenu).toHaveBeenCalled();
    });

    test('returns true on first call', () => {
      const game = new Game(makeClient());
      game.ready = false;
      expect(game.start()).toBe(true);
    });
  });

  describe('stop()', () => {
    test('sets started to false', () => {
      const game = new Game(makeClient());
      game.started = true;
      game.stop();
      expect(game.started).toBe(false);
    });

    test('sets ready to false', () => {
      const game = new Game(makeClient());
      game.ready = true;
      game.stop();
      expect(game.ready).toBe(false);
    });
  });

  describe('unload()', () => {
    test('returns true', () => {
      const game = new Game(makeClient());
      expect(game.unload()).toBe(true);
    });

    test('sets renderer to null', () => {
      const game = new Game(makeClient());
      game.unload();
      expect(game.renderer).toBeNull();
    });

    test('sets socket to null', () => {
      const game = new Game(makeClient());
      game.unload();
      expect(game.socket).toBeNull();
    });

    test('sets map to null', () => {
      const game = new Game(makeClient());
      game.unload();
      expect(game.map).toBeNull();
    });
  });

  describe('resize()', () => {
    test('calls renderer.resize()', () => {
      const game = new Game(makeClient());
      game.resize();
      expect(game.renderer.resize).toHaveBeenCalled();
    });

    test('calls pointer.resize() when pointer exists', () => {
      const game = new Game(makeClient());
      game.resize();
      expect(game.pointer.resize).toHaveBeenCalled();
    });
  });

  describe('createPlayer()', () => {
    test('sets game.player to a Player instance', () => {
      const game = new Game(makeClient());
      game.player = null;
      game.createPlayer();
      expect(game.player).not.toBeNull();
    });
  });

  describe('getScaleFactor()', () => {
    test('returns value from client.getScaleFactor()', () => {
      const client = makeClient();
      client.getScaleFactor.mockReturnValue(3);
      const game = new Game(client);
      expect(game.getScaleFactor()).toBe(3);
    });
  });

  describe('getStorage()', () => {
    test('returns the storage instance', () => {
      const game = new Game(makeClient());
      expect(game.getStorage()).toBe(game.storage);
    });
  });

  describe('getCamera()', () => {
    test('returns renderer.camera', () => {
      const game = new Game(makeClient());
      expect(game.getCamera()).toBe(game.renderer.camera);
    });
  });

  describe('getSprite()', () => {
    test('delegates to entities.getSprite()', () => {
      const game = new Game(makeClient());
      game.entities.getSprite.mockReturnValue({ name: 'goblin' });
      const sprite = game.getSprite('goblin');
      expect(game.entities.getSprite).toHaveBeenCalledWith('goblin');
      expect(sprite).toEqual({ name: 'goblin' });
    });
  });

  describe('tick()', () => {
    test('calls renderer.render() when ready', () => {
      const game = new Game(makeClient());
      game.ready = true;
      game.started = false;
      game.updater = { update: jest.fn() };
      game.tick();
      expect(game.renderer.render).toHaveBeenCalled();
    });

    test('calls updater.update() when ready', () => {
      const game = new Game(makeClient());
      game.ready = true;
      game.started = false;
      game.updater = { update: jest.fn() };
      game.tick();
      expect(game.updater.update).toHaveBeenCalled();
    });

    test('does not call renderer.render() when not ready', () => {
      const game = new Game(makeClient());
      game.ready = false;
      game.tick();
      expect(game.renderer.render).not.toHaveBeenCalled();
    });
  });
});
