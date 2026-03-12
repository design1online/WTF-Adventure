const mockJqueryElement = {
  fadeIn: jest.fn().mockReturnThis(),
  fadeOut: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  html: jest.fn().mockReturnThis(),
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

import Overlay from './overlay';

describe('Overlay', () => {
  let overlay;
  let mockInput;
  let mockPlayer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJqueryElement.css.mockReturnValue('none');
    mockJqueryElement.find.mockReturnValue(mockJqueryElement);

    mockPlayer = {
      id: 'player1',
    };

    mockInput = {
      getPlayer: jest.fn().mockReturnValue(mockPlayer),
      game: { time: 1000 },
    };

    overlay = new Overlay(mockInput);
  });

  describe('constructor', () => {
    test('sets input reference', () => {
      expect(overlay.input).toBe(mockInput);
    });

    test('initializes hovering as null', () => {
      expect(overlay.hovering).toBeNull();
    });

    test('initializes updateCallback as null', () => {
      expect(overlay.updateCallback).toBeNull();
    });
  });

  describe('validEntity', () => {
    test('returns false for null entity', () => {
      expect(overlay.validEntity(null)).toBeFalsy();
    });

    test('returns false for undefined entity', () => {
      expect(overlay.validEntity(undefined)).toBeFalsy();
    });

    test('returns false for entity that matches player id', () => {
      expect(overlay.validEntity({ id: 'player1', type: 'player' })).toBeFalsy();
    });

    test('returns false for projectile entity', () => {
      expect(overlay.validEntity({ id: 'proj1', type: 'projectile' })).toBeFalsy();
    });

    test('returns true for valid non-player entity', () => {
      expect(overlay.validEntity({ id: 'mob1', type: 'mob' })).toBeTruthy();
    });
  });

  describe('isVisible', () => {
    test('returns false when display is none', () => {
      mockJqueryElement.css.mockReturnValue('none');
      expect(overlay.isVisible()).toBe(false);
    });

    test('returns true when display is block', () => {
      mockJqueryElement.css.mockReturnValue('block');
      expect(overlay.isVisible()).toBe(true);
    });
  });

  describe('display', () => {
    test('calls fadeIn on attackInfo', () => {
      overlay.display();
      expect(mockJqueryElement.fadeIn).toHaveBeenCalledWith('fast');
    });
  });

  describe('hide', () => {
    test('calls fadeOut on attackInfo', () => {
      overlay.hide();
      expect(mockJqueryElement.fadeOut).toHaveBeenCalledWith('fast');
    });
  });

  describe('clean', () => {
    test('clears details html and sets hovering to null', () => {
      overlay.hovering = { id: 'mob1' };
      overlay.clean();
      expect(overlay.hovering).toBeNull();
      expect(mockJqueryElement.html).toHaveBeenCalledWith('');
    });
  });

  describe('onUpdate', () => {
    test('sets updateCallback', () => {
      const cb = jest.fn();
      overlay.onUpdate(cb);
      expect(overlay.updateCallback).toBe(cb);
    });
  });

  describe('getGame', () => {
    test('returns the game from input', () => {
      expect(overlay.getGame()).toBe(mockInput.game);
    });
  });

  describe('update', () => {
    test('hides overlay and clears hovering for null entity', () => {
      const hideSpy = jest.spyOn(overlay, 'hide');
      mockJqueryElement.css.mockReturnValue('block'); // isVisible returns true
      overlay.update(null);
      expect(overlay.hovering).toBeNull();
      expect(hideSpy).toHaveBeenCalled();
    });

    test('does not hide when already hidden for null entity', () => {
      const hideSpy = jest.spyOn(overlay, 'hide');
      mockJqueryElement.css.mockReturnValue('none'); // isVisible returns false
      overlay.update(null);
      expect(hideSpy).not.toHaveBeenCalled();
    });

    test('displays overlay for valid entity that is not visible', () => {
      const displaySpy = jest.spyOn(overlay, 'display');
      mockJqueryElement.css.mockReturnValue('none'); // isVisible returns false
      const entity = {
        id: 'mob1',
        type: 'mob',
        label: 'Goblin',
        hitPoints: 50,
        maxHitPoints: 100,
      };
      overlay.update(entity);
      expect(displaySpy).toHaveBeenCalled();
    });

    test('sets hovering to entity for valid entity', () => {
      mockJqueryElement.css.mockReturnValue('none');
      const entity = {
        id: 'mob1',
        type: 'mob',
        label: 'Goblin',
        hitPoints: 50,
        maxHitPoints: 100,
      };
      overlay.update(entity);
      expect(overlay.hovering).toBe(entity);
    });

    test('sets name html from entity label for non-player', () => {
      mockJqueryElement.css.mockReturnValue('none');
      const entity = {
        id: 'mob1',
        type: 'mob',
        label: 'Goblin',
        hitPoints: 50,
        maxHitPoints: 100,
      };
      overlay.update(entity);
      expect(mockJqueryElement.html).toHaveBeenCalledWith('Goblin');
    });

    test('sets name html from username for player entity', () => {
      mockJqueryElement.css.mockReturnValue('none');
      const entity = {
        id: 'other-player',
        type: 'player',
        username: 'Bob',
        hitPoints: 80,
        maxHitPoints: 100,
      };
      overlay.update(entity);
      expect(mockJqueryElement.html).toHaveBeenCalledWith('Bob');
    });
  });

  describe('hasHealth', () => {
    test('returns true for mob', () => {
      overlay.hovering = { type: 'mob' };
      expect(overlay.hasHealth()).toBe(true);
    });

    test('returns true for player', () => {
      overlay.hovering = { type: 'player' };
      expect(overlay.hasHealth()).toBe(true);
    });

    test('returns false for npc', () => {
      overlay.hovering = { type: 'npc' };
      expect(overlay.hasHealth()).toBe(false);
    });
  });
});
