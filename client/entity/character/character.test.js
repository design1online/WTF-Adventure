import Character from './character';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../utils/transition', () => {
  return jest.fn().mockImplementation(() => ({
    startValue: 0,
    endValue: 0,
    duration: 0,
    inProgress: false,
  }));
});

jest.mock('../../utils/modules', () => ({
  __esModule: true,
  default: {
    Orientation: {
      Up: 0,
      Down: 1,
      Left: 2,
      Right: 3,
      toString: (o) => ['up', 'down', 'left', 'right'][o] || null,
    },
    Actions: {
      Idle: 0,
      Attack: 1,
      Walk: 2,
    },
    Types: { Player: 0 },
  },
}));

// Animation needs a mock so loadGlobals() doesn't fail
jest.mock('../animation', () => {
  return jest.fn().mockImplementation(() => ({
    name: 'mock',
    setSpeed: jest.fn(),
    setCount: jest.fn(),
    reset: jest.fn(),
    count: 0,
  }));
});

// Entity is the parent class – mock out its deep deps
jest.mock('../entityhandler', () => {
  return jest.fn().mockImplementation(() => ({
    setGame: jest.fn(),
    loadEntity: jest.fn(),
  }));
});

describe('Character', () => {
  let character;

  beforeEach(() => {
    jest.clearAllMocks();
    character = new Character(1, 'player', 'Hero');
  });

  describe('constructor', () => {
    it('sets default numeric stats to -1', () => {
      expect(character.hitPoints).toBe(-1);
      expect(character.maxHitPoints).toBe(-1);
      expect(character.mana).toBe(-1);
      expect(character.maxMana).toBe(-1);
    });

    it('sets default boolean flags to false', () => {
      expect(character.dead).toBe(false);
      expect(character.following).toBe(false);
      expect(character.attacking).toBe(false);
      expect(character.frozen).toBe(false);
      expect(character.stunned).toBe(false);
    });

    it('sets default position values', () => {
      expect(character.nextGridX).toBe(-1);
      expect(character.nextGridY).toBe(-1);
      expect(character.prevGridX).toBe(-1);
      expect(character.prevGridY).toBe(-1);
    });

    it('initializes attackers as an empty object', () => {
      expect(character.attackers).toEqual({});
    });

    it('initializes path and target to null', () => {
      expect(character.path).toBeNull();
      expect(character.target).toBeNull();
    });

    it('sets animation speeds', () => {
      expect(character.idleSpeed).toBe(450);
      expect(character.attackAnimationSpeed).toBe(50);
      expect(character.walkAnimationSpeed).toBe(100);
      expect(character.movementSpeed).toBe(250);
    });

    it('loads global animations', () => {
      expect(character.criticalAnimation).toBeDefined();
      expect(character.terrorAnimation).toBeDefined();
      expect(character.stunAnimation).toBeDefined();
      expect(character.explosionAnimation).toBeDefined();
    });
  });

  describe('addAttacker() / removeAttacker() / hasAttacker()', () => {
    it('adds an attacker and detects it', () => {
      const attacker = { instance: 'mob-42', id: 42 };
      character.addAttacker(attacker);
      expect(character.hasAttacker(attacker)).toBe(true);
    });

    it('returns false when adding a duplicate attacker', () => {
      const attacker = { instance: 'mob-42', id: 42 };
      character.addAttacker(attacker);
      expect(character.addAttacker(attacker)).toBe(false);
    });

    it('removes an attacker (keyed by instance, deleted by id)', () => {
      // Source bug: addAttacker keys by character.instance but removeAttacker
      // deletes by character.id. When instance === id the delete works correctly.
      const attacker = { instance: 'mob-42', id: 'mob-42' };
      character.addAttacker(attacker);
      character.removeAttacker(attacker);
      expect(character.hasAttacker(attacker)).toBe(false);
    });
  });

  describe('setTarget() / hasTarget() / removeTarget()', () => {
    it('sets a target and hasTarget returns true', () => {
      const target = { id: 7 };
      character.setTarget(target);
      expect(character.hasTarget()).toBe(true);
      expect(character.target).toBe(target);
    });

    it('removeTarget clears the target', () => {
      character.setTarget({ id: 7 });
      character.removeTarget();
      expect(character.hasTarget()).toBe(false);
    });

    it('removeTarget returns false when no target set', () => {
      expect(character.removeTarget()).toBe(false);
    });

    it('setting null target removes existing target', () => {
      character.setTarget({ id: 7 });
      character.setTarget(null);
      expect(character.hasTarget()).toBe(false);
    });
  });

  describe('setHitPoints()', () => {
    it('updates hitPoints and fires callback', () => {
      const cb = jest.fn();
      character.onHitPoints(cb);
      character.setHitPoints(50);
      expect(character.hitPoints).toBe(50);
      expect(cb).toHaveBeenCalledWith(50);
    });
  });

  describe('setMaxHitPoints()', () => {
    it('updates maxHitPoints', () => {
      character.setMaxHitPoints(100);
      expect(character.maxHitPoints).toBe(100);
    });
  });

  describe('hasWeapon() / hasShadow()', () => {
    it('returns false when weapon/shadow are falsy', () => {
      expect(character.hasWeapon()).toBe(false);
      expect(character.hasShadow()).toBe(false);
    });

    it('returns true when weapon/shadow are set', () => {
      character.weapon = true;
      character.shadow = true;
      expect(character.hasWeapon()).toBe(true);
      expect(character.hasShadow()).toBe(true);
    });
  });

  describe('hasPath()', () => {
    it('returns false initially', () => {
      expect(character.hasPath()).toBe(false);
    });
  });

  describe('isAttacked()', () => {
    it('returns false with no attackers', () => {
      expect(character.isAttacked()).toBe(false);
    });

    it('returns true when there are attackers', () => {
      character.attackers['mob-1'] = { instance: 'mob-1' };
      expect(character.isAttacked()).toBe(true);
    });
  });

  describe('forget()', () => {
    it('clears all attackers', () => {
      character.attackers['mob-1'] = {};
      character.forget();
      expect(character.attackers).toEqual({});
    });
  });

  describe('changedPath()', () => {
    it('returns false when newDestination is null', () => {
      character.newDestination = null;
      expect(character.changedPath()).toBe(false);
    });

    it('returns true when newDestination is set', () => {
      character.newDestination = { x: 1, y: 2 };
      expect(character.changedPath()).toBe(true);
    });
  });

  describe('setOrientation()', () => {
    it('updates the orientation', () => {
      character.setOrientation(0);
      expect(character.orientation).toBe(0);
    });
  });

  describe('triggerHealthBar() / clearHealthBar()', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('sets healthBarVisible to true', () => {
      character.triggerHealthBar();
      expect(character.healthBarVisible).toBe(true);
    });

    it('clearHealthBar hides the health bar', () => {
      character.triggerHealthBar();
      character.clearHealthBar();
      expect(character.healthBarVisible).toBe(false);
      expect(character.healthBarTimeout).toBeNull();
    });
  });

  describe('getEffectAnimation()', () => {
    it('returns null when no effect is active', () => {
      expect(character.getEffectAnimation()).toBeNull();
    });

    it('returns criticalAnimation when critical is true', () => {
      character.critical = true;
      expect(character.getEffectAnimation()).toBe(character.criticalAnimation);
    });
  });

  describe('getActiveEffect()', () => {
    it('returns null when no effect is active', () => {
      expect(character.getActiveEffect()).toBeNull();
    });

    it('returns "criticaleffect" when critical', () => {
      character.critical = true;
      expect(character.getActiveEffect()).toBe('criticaleffect');
    });
  });

  describe('backOff()', () => {
    it('clears attacking, following, and target', () => {
      character.attacking = true;
      character.following = true;
      character.setTarget({ id: 1 });
      character.backOff();
      expect(character.attacking).toBe(false);
      expect(character.following).toBe(false);
      expect(character.target).toBeNull();
    });
  });

  describe('proceed()', () => {
    it('sets newDestination', () => {
      character.proceed(3, 4);
      expect(character.newDestination).toEqual({ x: 3, y: 4 });
    });
  });

  describe('go()', () => {
    it('returns false when the character is frozen', () => {
      character.frozen = true;
      expect(character.go(5, 5)).toBe(false);
    });
  });

  describe('requestPathfinding()', () => {
    it('returns null when no callback is registered', () => {
      expect(character.requestPathfinding(1, 2)).toBeNull();
    });

    it('calls the callback and returns its value', () => {
      const fakePath = [[0, 0], [1, 1]];
      character.onRequestPath(() => fakePath);
      expect(character.requestPathfinding(1, 1)).toBe(fakePath);
    });
  });
});
