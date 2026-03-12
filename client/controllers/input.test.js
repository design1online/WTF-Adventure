const mockJqueryElement = {
  fadeIn: jest.fn().mockReturnThis(),
  fadeOut: jest.fn().mockReturnThis(),
  focus: jest.fn().mockReturnThis(),
  blur: jest.fn().mockReturnThis(),
  val: jest.fn().mockReturnValue(''),
  is: jest.fn().mockReturnValue(false),
  addClass: jest.fn().mockReturnThis(),
  removeClass: jest.fn().mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  scrollTop: jest.fn().mockReturnThis(),
  click: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnValue({ left: 0, top: 0 }),
  css: jest.fn().mockReturnValue('none'),
};

jest.mock('jquery', () => {
  const jq = jest.fn(() => mockJqueryElement);
  jq.fn = {};
  return jq;
});

jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../utils/modules', () => ({
  Keys: {
    Up: 38, Down: 40, Left: 37, Right: 39,
    W: 87, A: 65, S: 83, D: 68, Enter: 13,
  },
  InputType: { Key: 0, LeftClick: 1 },
  Hovering: { Item: 'item', Mob: 'mob', Player: 'player', NPC: 'npc' },
}));

jest.mock('../network/packets', () => ({
  Chat: 'chat',
  Target: 'target',
  TargetOpcode: { Attack: 0 },
}));

jest.mock('../utils/detect', () => ({
  isSafari: jest.fn().mockReturnValue(false),
}));

jest.mock('../entity/animation', () => {
  return jest.fn().mockImplementation(() => ({
    setSpeed: jest.fn(),
    setRow: jest.fn(),
    currentFrame: { x: 0, y: 0 },
  }));
});

jest.mock('./chat', () => {
  return jest.fn().mockImplementation(() => ({
    isActive: jest.fn().mockReturnValue(false),
    key: jest.fn(),
    toggle: jest.fn(),
    hideInput: jest.fn(),
    input: mockJqueryElement,
  }));
});

jest.mock('./overlay', () => {
  return jest.fn().mockImplementation(() => ({
    update: jest.fn(),
  }));
});

import Input from './input';

describe('Input', () => {
  let input;
  let mockGame;
  let mockPlayer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJqueryElement.val.mockReturnValue('');
    mockJqueryElement.is.mockReturnValue(false);

    mockPlayer = {
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false,
      disableAction: false,
      stunned: false,
      gridX: 5,
      gridY: 5,
      id: 'player1',
      removeTarget: jest.fn(),
      setTarget: jest.fn(),
      follow: jest.fn(),
      go: jest.fn(),
      hasPath: jest.fn().mockReturnValue(false),
      isRanged: jest.fn().mockReturnValue(false),
      getDistance: jest.fn().mockReturnValue(10),
      lookAt: jest.fn(),
    };

    mockGame = {
      client: {
        canvas: mockJqueryElement,
      },
      renderer: {
        mobile: false,
        camera: { gridX: 0, gridY: 0 },
        tileSize: 16,
        getDrawingScale: jest.fn().mockReturnValue(2),
        backgroundCanvas: { width: 800, height: 600 },
      },
      player: mockPlayer,
      socket: { send: jest.fn() },
      zoning: null,
      pvp: false,
      audio: { song: null, update: jest.fn() },
      interface: {
        hideAll: jest.fn(),
        actions: {
          hidePlayerActions: jest.fn(),
          showPlayerActions: jest.fn(),
          isVisible: jest.fn().mockReturnValue(false),
        },
      },
      time: 1000,
      getSprite: jest.fn().mockReturnValue({
        loaded: true,
        loadSprite: jest.fn(),
        width: 16,
        height: 16,
      }),
      getEntityAt: jest.fn().mockReturnValue(null),
      getCamera: jest.fn().mockReturnValue({ gridX: 0, gridY: 0 }),
    };

    input = new Input(mockGame);
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(input.game).toBe(mockGame);
    });

    test('sets client reference', () => {
      expect(input.client).toBe(mockGame.client);
    });

    test('sets renderer reference', () => {
      expect(input.renderer).toBe(mockGame.renderer);
    });

    test('initializes selectedCellVisible as false', () => {
      expect(input.selectedCellVisible).toBe(false);
    });

    test('initializes cursorVisible as true', () => {
      expect(input.cursorVisible).toBe(true);
    });

    test('initializes selectedX and selectedY to -1', () => {
      expect(input.selectedX).toBe(-1);
      expect(input.selectedY).toBe(-1);
    });

    test('initializes mouse to {x:0, y:0}', () => {
      expect(input.mouse).toEqual({ x: 0, y: 0 });
    });

    test('creates chatHandler', () => {
      expect(input.chatHandler).toBeDefined();
    });

    test('creates overlay', () => {
      expect(input.overlay).toBeDefined();
    });
  });

  describe('setPosition', () => {
    test('sets selectedX and selectedY', () => {
      input.setPosition(10, 20);
      expect(input.selectedX).toBe(10);
      expect(input.selectedY).toBe(20);
    });
  });

  describe('updateCursor', () => {
    test('does nothing when cursorVisible is false', () => {
      input.cursorVisible = false;
      input.cursor = 'hand';
      input.newCursor = 'sword';
      input.updateCursor();
      expect(input.cursor).toBe('hand');
    });

    test('updates cursor to newCursor when they differ', () => {
      input.cursorVisible = true;
      input.cursor = null;
      input.newCursor = 'sword';
      input.updateCursor();
      expect(input.cursor).toBe('sword');
    });

    test('updates targetColour to newTargetColour when they differ', () => {
      input.cursorVisible = true;
      input.targetColour = null;
      input.newTargetColour = 'red';
      input.updateCursor();
      expect(input.targetColour).toBe('red');
    });
  });

  describe('setAttackTarget', () => {
    test('sets mobileTargetColour to red', () => {
      input.setAttackTarget();
      expect(input.mobileTargetColour).toBe('rgb(255, 51, 0)');
    });

    test('calls setRow(1) on targetAnimation', () => {
      input.setAttackTarget();
      expect(input.targetAnimation.setRow).toHaveBeenCalledWith(1);
    });
  });

  describe('setPassiveTarget', () => {
    test('sets mobileTargetColour to green', () => {
      input.setPassiveTarget();
      expect(input.mobileTargetColour).toBe('rgb(51, 255, 0)');
    });

    test('calls setRow(0) on targetAnimation', () => {
      input.setPassiveTarget();
      expect(input.targetAnimation.setRow).toHaveBeenCalledWith(0);
    });
  });

  describe('setCursor', () => {
    test('sets newCursor when cursor is provided', () => {
      input.setCursor('bow');
      expect(input.newCursor).toBe('bow');
    });

    test('logs error when cursor is null', () => {
      const log = require('../lib/log');
      input.setCursor(null);
      expect(log.error).toHaveBeenCalled();
    });
  });

  describe('isTargetable', () => {
    test('returns true for mob entities', () => {
      expect(input.isTargetable({ type: 'mob', pvp: false })).toBe(true);
    });

    test('returns true for npc entities', () => {
      expect(input.isTargetable({ type: 'npc' })).toBe(true);
    });

    test('returns true for chest entities', () => {
      expect(input.isTargetable({ type: 'chest' })).toBe(true);
    });

    test('returns false for item entities', () => {
      expect(input.isTargetable({ type: 'item' })).toBe(false);
    });
  });

  describe('isAttackable', () => {
    test('returns true for mob entities', () => {
      expect(input.isAttackable({ type: 'mob' })).toBe(true);
    });

    test('returns false for npc entities', () => {
      expect(input.isAttackable({ type: 'npc' })).toBe(false);
    });

    test('returns true for pvp player when game pvp is active', () => {
      mockGame.pvp = true;
      expect(input.isAttackable({ type: 'player', pvp: true })).toBe(true);
    });
  });

  describe('getPlayer', () => {
    test('returns the game player', () => {
      expect(input.getPlayer()).toBe(mockPlayer);
    });
  });

  describe('getActions', () => {
    test('returns the game interface actions', () => {
      expect(input.getActions()).toBe(mockGame.interface.actions);
    });
  });

  describe('keyUp', () => {
    test('sets moveUp to false for W key', () => {
      mockPlayer.moveUp = true;
      input.keyUp(87); // W
      expect(mockPlayer.moveUp).toBe(false);
    });

    test('sets moveDown to false for S key', () => {
      mockPlayer.moveDown = true;
      input.keyUp(83); // S
      expect(mockPlayer.moveDown).toBe(false);
    });

    test('sets disableAction to false', () => {
      mockPlayer.disableAction = true;
      input.keyUp(999);
      expect(mockPlayer.disableAction).toBe(false);
    });
  });

  describe('handle', () => {
    test('delegates to chatHandler when chat is active and Key input', () => {
      input.chatHandler.isActive.mockReturnValue(true);
      input.handle(0, 13); // Key, Enter
      expect(input.chatHandler.key).toHaveBeenCalledWith(13);
    });

    test('toggles chat on Enter key when not active', () => {
      input.chatHandler.isActive.mockReturnValue(false);
      input.handle(0, 13); // Key, Enter
      expect(input.chatHandler.toggle).toHaveBeenCalled();
    });

    test('sets player moveUp for Up key', () => {
      input.chatHandler.isActive.mockReturnValue(false);
      input.handle(0, 38); // Up
      expect(mockPlayer.moveUp).toBe(true);
    });
  });

  describe('getCoords', () => {
    test('returns x and y coordinates', () => {
      const coords = input.getCoords();
      expect(coords).toHaveProperty('x');
      expect(coords).toHaveProperty('y');
    });
  });

  describe('moveCursor', () => {
    test('returns early when on mobile', () => {
      mockGame.renderer.mobile = true;
      const spy = jest.spyOn(input, 'getCoords');
      input.moveCursor();
      expect(spy).not.toHaveBeenCalled();
    });

    test('returns early when no renderer camera', () => {
      mockGame.renderer.camera = null;
      const spy = jest.spyOn(input, 'getCoords');
      input.moveCursor();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
