const mockJqueryElement = {
  css: jest.fn().mockReturnValue('none'),
  text: jest.fn().mockReturnThis(),
  click: jest.fn().mockReturnThis(),
  fadeIn: jest.fn().mockReturnThis(),
  fadeOut: jest.fn().mockReturnThis(),
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

jest.mock('../interface/inventory', () => {
  return jest.fn().mockImplementation(() => ({
    loadInventory: jest.fn(),
    resize: jest.fn(),
    isVisible: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
    container: {},
  }));
});

jest.mock('../interface/profile/profile', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn(),
    isVisible: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
    settings: { isVisible: jest.fn().mockReturnValue(false) },
  }));
});

jest.mock('../interface/actions', () => {
  return jest.fn().mockImplementation(() => ({
    isVisible: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
    showPlayerActions: jest.fn(),
  }));
});

jest.mock('../interface/bank', () => {
  return jest.fn().mockImplementation(() => ({
    loadBank: jest.fn(),
    resize: jest.fn(),
    isVisible: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
  }));
});

jest.mock('../interface/enchant', () => {
  return jest.fn().mockImplementation(() => ({
    isVisible: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
  }));
});

jest.mock('../interface/warp', () => {
  return jest.fn().mockImplementation(() => ({
    isVisible: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
  }));
});

import Interface from './interface';
import Inventory from '../interface/inventory';
import Bank from '../interface/bank';

describe('Interface', () => {
  let iface;
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJqueryElement.css.mockReturnValue('none');

    mockGame = {
      time: 1000,
      input: {
        chatHandler: {
          input: {
            is: jest.fn().mockReturnValue(false),
          },
          hideInput: jest.fn(),
        },
      },
    };

    iface = new Interface(mockGame);
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(iface.game).toBe(mockGame);
    });

    test('initializes inventory as null', () => {
      expect(iface.inventory).toBeNull();
    });

    test('initializes profile as null', () => {
      expect(iface.profile).toBeNull();
    });

    test('initializes bank as null', () => {
      expect(iface.bank).toBeNull();
    });

    test('initializes enchant as null', () => {
      expect(iface.enchant).toBeNull();
    });

    test('creates actions in constructor', () => {
      expect(iface.actions).toBeDefined();
    });

    test('creates warp in constructor', () => {
      expect(iface.warp).toBeDefined();
    });
  });

  describe('loadInventory', () => {
    test('creates inventory with size', () => {
      iface.loadInventory(28, []);
      expect(iface.inventory).toBeDefined();
      expect(Inventory).toHaveBeenCalledWith(mockGame, 28);
    });

    test('calls loadInventory on the inventory instance', () => {
      const data = [{ id: 1 }];
      iface.loadInventory(28, data);
      expect(iface.inventory.loadInventory).toHaveBeenCalledWith(data);
    });
  });

  describe('loadBank', () => {
    test('creates bank with size', () => {
      iface.loadInventory(28, []);
      iface.loadBank(100, []);
      expect(iface.bank).toBeDefined();
      expect(Bank).toHaveBeenCalledWith(mockGame, iface.inventory.container, 100);
    });

    test('calls loadBank on the bank instance', () => {
      iface.loadInventory(28, []);
      const data = [{ id: 2 }];
      iface.loadBank(100, data);
      expect(iface.bank.loadBank).toHaveBeenCalledWith(data);
    });

    test('loads enchant when bank is loaded', () => {
      iface.loadInventory(28, []);
      iface.loadBank(100, []);
      expect(iface.enchant).toBeDefined();
    });
  });

  describe('loadProfile', () => {
    test('creates profile if not already created', () => {
      expect(iface.profile).toBeNull();
      iface.loadProfile();
      expect(iface.profile).toBeDefined();
    });

    test('does not recreate profile if already exists', () => {
      iface.loadProfile();
      const first = iface.profile;
      iface.loadProfile();
      expect(iface.profile).toBe(first);
    });
  });

  describe('loadActions', () => {
    test('creates actions if not already created', () => {
      iface.actions = null;
      iface.loadActions();
      expect(iface.actions).toBeDefined();
    });
  });

  describe('loadWarp', () => {
    test('creates warp if not already created', () => {
      iface.warp = null;
      iface.loadWarp();
      expect(iface.warp).toBeDefined();
    });
  });

  describe('loadEnchant', () => {
    test('creates enchant if not already created', () => {
      iface.enchant = null;
      iface.loadEnchant();
      expect(iface.enchant).toBeDefined();
    });
  });

  describe('displayNotify', () => {
    test('sets display to block for notify elements', () => {
      mockJqueryElement.css.mockReturnValue('none'); // isNotifyVisible returns false
      iface.displayNotify('Test message');
      expect(mockJqueryElement.css).toHaveBeenCalledWith('display', 'block');
    });

    test('does not display if already visible', () => {
      mockJqueryElement.css.mockReturnValue('block'); // isNotifyVisible returns true
      iface.displayNotify('Test');
      // css should not have been called with 'display', 'block'
      const displayBlockCalls = mockJqueryElement.css.mock.calls.filter(
        call => call[0] === 'display' && call[1] === 'block'
      );
      expect(displayBlockCalls).toHaveLength(0);
    });
  });

  describe('displayConfirm', () => {
    test('sets display to block for confirm element', () => {
      mockJqueryElement.css.mockReturnValue('none'); // isConfirmVisible returns false
      iface.displayConfirm('Are you sure?');
      expect(mockJqueryElement.css).toHaveBeenCalledWith('display', 'block');
    });
  });

  describe('hideNotify', () => {
    test('sets display to none for fade, notify, message', () => {
      iface.hideNotify();
      expect(mockJqueryElement.css).toHaveBeenCalledWith('display', 'none');
    });
  });

  describe('hideConfirm', () => {
    test('sets display to none for confirm', () => {
      iface.hideConfirm();
      expect(mockJqueryElement.css).toHaveBeenCalledWith('display', 'none');
    });
  });

  describe('isNotifyVisible', () => {
    test('returns false when display is none', () => {
      mockJqueryElement.css.mockReturnValue('none');
      expect(iface.isNotifyVisible()).toBe(false);
    });

    test('returns true when display is block', () => {
      mockJqueryElement.css.mockReturnValue('block');
      expect(iface.isNotifyVisible()).toBe(true);
    });
  });

  describe('isConfirmVisible', () => {
    test('returns false when display is none', () => {
      mockJqueryElement.css.mockReturnValue('none');
      expect(iface.isConfirmVisible()).toBe(false);
    });

    test('returns true when display is block', () => {
      mockJqueryElement.css.mockReturnValue('block');
      expect(iface.isConfirmVisible()).toBe(true);
    });
  });

  describe('resize', () => {
    test('calls resize on inventory when it exists', () => {
      iface.loadInventory(28, []);
      iface.resize();
      expect(iface.inventory.resize).toHaveBeenCalled();
    });

    test('does not throw when all sub-interfaces are null', () => {
      expect(() => iface.resize()).not.toThrow();
    });
  });

  describe('hideAll', () => {
    test('does not throw when all sub-interfaces are null', () => {
      expect(() => iface.hideAll()).not.toThrow();
    });

    test('hides inventory when visible', () => {
      iface.loadInventory(28, []);
      iface.inventory.isVisible.mockReturnValue(true);
      iface.hideAll();
      expect(iface.inventory.hide).toHaveBeenCalled();
    });

    test('hides actions when visible', () => {
      iface.actions.isVisible.mockReturnValue(true);
      iface.hideAll();
      expect(iface.actions.hide).toHaveBeenCalled();
    });
  });
});
