jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../utils/queue', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    forEachQueue: jest.fn(),
    reset: jest.fn(),
  }));
});

jest.mock('../renderer/infos/splat', () => {
  return jest.fn().mockImplementation((id, type, text, x, y, statique) => ({
    id,
    type,
    text,
    x,
    y,
    setColours: jest.fn(),
    onDestroy: jest.fn(),
    update: jest.fn(),
  }));
});

jest.mock('../utils/modules', () => ({
  Hits: {
    Damage: 0,
    Poison: 1,
    Heal: 2,
    Mana: 3,
    Experience: 4,
    LevelUp: 5,
    Critical: 6,
    Stun: 7,
  },
  DamageColours: {
    received: { fill: 'red', stroke: 'darkred' },
    inflicted: { fill: 'white', stroke: 'gray' },
    healed: { fill: 'green', stroke: 'darkgreen' },
    mana: { fill: 'blue', stroke: 'darkblue' },
    exp: { fill: 'yellow', stroke: 'gold' },
  },
}));

jest.mock('../utils/util', () => ({
  isInt: jest.fn().mockReturnValue(true),
}));

import Info from './info';
import Splat from '../renderer/infos/splat';

describe('Info', () => {
  let info;
  let mockGame;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      time: 1000,
    };

    info = new Info(mockGame);
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(info.game).toBe(mockGame);
    });

    test('initializes infos as empty object', () => {
      expect(info.infos).toEqual({});
    });

    test('creates a destroyQueue', () => {
      expect(info.destroyQueue).toBeDefined();
    });
  });

  describe('getCount', () => {
    test('returns 0 when no infos', () => {
      expect(info.getCount()).toBe(0);
    });

    test('returns correct count when infos exist', () => {
      info.infos['a'] = {};
      info.infos['b'] = {};
      expect(info.getCount()).toBe(2);
    });
  });

  describe('generateId', () => {
    test('generates an ID string from game time, info, and coordinates', () => {
      const id = info.generateId(10, 5, 7);
      expect(id).toBe('1000105' + '7');
    });

    test('uses Math.abs on info value', () => {
      const id = info.generateId(-5, 0, 0);
      expect(id).toBe('100050' + '0');
    });
  });

  describe('addInfo', () => {
    test('adds an info to the infos object', () => {
      const mockSplat = { id: 'test-id', onDestroy: jest.fn() };
      info.addInfo(mockSplat);
      expect(info.infos['test-id']).toBe(mockSplat);
    });

    test('registers onDestroy callback', () => {
      const mockSplat = { id: 'test-id', onDestroy: jest.fn() };
      info.addInfo(mockSplat);
      expect(mockSplat.onDestroy).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    test('calls hit for Damage type', () => {
      const hitSpy = jest.spyOn(info, 'hit');
      info.create(0, [10, false], 5, 5); // Module.Hits.Damage = 0
      expect(hitSpy).toHaveBeenCalled();
    });

    test('calls hit for Stun type', () => {
      const hitSpy = jest.spyOn(info, 'hit');
      info.create(7, [5, true], 1, 1); // Module.Hits.Stun = 7
      expect(hitSpy).toHaveBeenCalled();
    });

    test('calls hit for Critical type', () => {
      const hitSpy = jest.spyOn(info, 'hit');
      info.create(6, [20, false], 2, 2); // Module.Hits.Critical = 6
      expect(hitSpy).toHaveBeenCalled();
    });

    test('calls regenerate for Heal type', () => {
      const regenSpy = jest.spyOn(info, 'regenerate');
      info.create(2, [50], 3, 3); // Module.Hits.Heal = 2
      expect(regenSpy).toHaveBeenCalled();
    });

    test('calls regenerate for Mana type', () => {
      const regenSpy = jest.spyOn(info, 'regenerate');
      info.create(3, [30], 4, 4); // Module.Hits.Mana = 3
      expect(regenSpy).toHaveBeenCalled();
    });

    test('calls regenerate for Experience type', () => {
      const regenSpy = jest.spyOn(info, 'regenerate');
      info.create(4, [100], 6, 6); // Module.Hits.Experience = 4
      expect(regenSpy).toHaveBeenCalled();
    });

    test('calls levelup for LevelUp type', () => {
      const levelupSpy = jest.spyOn(info, 'levelup');
      info.create(5, [], 7, 7); // Module.Hits.LevelUp = 5
      expect(levelupSpy).toHaveBeenCalled();
    });

    test('does nothing for unknown type', () => {
      expect(() => info.create(999, [], 0, 0)).not.toThrow();
    });
  });

  describe('hit', () => {
    test('creates a Splat for damage hit', () => {
      info.hit(0, [15, false], 2, 3);
      expect(Splat).toHaveBeenCalled();
    });

    test('shows MISS when damage is less than 1', () => {
      info.hit(0, [0, false], 2, 3);
      expect(Splat).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'MISS',
        expect.anything(),
        expect.anything(),
        false,
      );
    });
  });

  describe('regenerate', () => {
    test('creates a Splat for heal', () => {
      info.regenerate(2, [25], 1, 1); // Heal
      expect(Splat).toHaveBeenCalled();
    });

    test('returns early if amount is less than 1', () => {
      info.regenerate(2, [0], 1, 1);
      expect(Splat).not.toHaveBeenCalled();
    });
  });

  describe('levelup', () => {
    test('creates a Splat with Level Up text', () => {
      info.levelup(5, 10, 10);
      expect(Splat).toHaveBeenCalledWith(
        expect.anything(),
        5,
        'Level Up!',
        10,
        10,
        false,
      );
    });
  });

  describe('update', () => {
    test('calls update on each info', () => {
      const mockInfo = { update: jest.fn() };
      info.infos['abc'] = mockInfo;
      info.update(2000);
      expect(mockInfo.update).toHaveBeenCalledWith(2000);
    });

    test('resets destroy queue after processing', () => {
      info.update(1000);
      expect(info.destroyQueue.reset).toHaveBeenCalled();
    });
  });

  describe('forEachInfo', () => {
    test('calls callback for each info', () => {
      const cb = jest.fn();
      info.infos['x'] = { id: 'x' };
      info.infos['y'] = { id: 'y' };
      info.forEachInfo(cb);
      expect(cb).toHaveBeenCalledTimes(2);
    });
  });
});
