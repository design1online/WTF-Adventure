/* global document, window, Event */
import Client from '.';

// mock the Detect import
jest.mock('./utils/detect');

/**
 * @test {Client}
 */
describe('Client', () => {

  let instance;

  beforeEach(() => {
    instance = new Client();
  });

  /**
   * @test {Client#constructor}
   */
  test('.constructor()', () => {
    expect(instance).toBeDefined();
  });

  /**
   * @test {Client#loadClient}
   */
  test('.loadClient()', () => {
    const spy = jest.spyOn(instance, "loadCharacter");
    expect(spy.mock.calls.length).toEqual(0);

    instance.loadClient();

    expect(instance.keydownEventListener).toBeDefined();
    expect(spy.mock.calls.length).toEqual(1);
  });

  /**
   * @test {Client#welcomeContinue}
   */
  describe('.welcomeContinue()', () => {

    it('returns false if no game', () => {
      // returns false if no game
      expect(instance.game).toEqual(null);
      expect(instance.welcomeContinue()).toBe(false);
    });
    
    it('dismisses the welcome screen', () => {
      // mock the body
      instance.body = {
        removeClass: jest.fn()
      }

      // mock the game
      instance.game = {
        storage: {
          data: {
            welcome: true
          },
          save: jest.fn()
        }
      };

      expect(instance.game.storage.data.welcome).toEqual(true);
      const welcomeScreenDismissed = instance.welcomeContinue();
      expect(instance.game.storage.data.welcome).toEqual(false);
      expect(instance.game.storage.save).toHaveBeenCalled();
      expect(instance.body.removeClass).toHaveBeenCalledWith('welcomeMessage');
      expect(welcomeScreenDismissed).toEqual(true);
    });
  });

  describe('.login()', () => {
    it('returns false if currently logging in', () => {
      instance.loggingIn = true;
      expect(instance.login()).toEqual(false);
    });

    it('returns false if no game', () => {
      instance.game = null;
      expect(instance.login()).toEqual(false);
    });

    it('returns false if game is not loaded', () => {
      instance.game = { loaded: false };
      expect(instance.login()).toEqual(false);
    });

    it('returns false if there is a statusMessage', () => {
      instance.game = { loaded: true };
      instance.statusMessage = 'something';
      expect(instance.login()).toEqual(false);
    });

    it('returns false if cannot verify login form', () => {
      instance.game = { loaded: true };
      instance.statusMessage = 'something';
      instance.verifyForm = () => { return false; }
      expect(instance.login()).toEqual(false);
    });

    it('returns true and connects to the game', () => {
      instance.loggingIn = false;
      instance.game = { loaded: true, connect: jest.fn() };
      instance.statusMessage = null;
      instance.verifyForm = () => { return true; }
      expect(instance.login()).toEqual(true);
      expect(instance.game.connect).toHaveBeenCalled();
    });
  });

  describe('.loginAsGuest()', () => {
    it ('returns false if no game', () => {
      expect(instance.loginAsGuest()).toEqual(false);
    });

    it ('returns true if game exists', () => {
      instance.login = jest.fn();
      instance.game = {};
      expect(instance.guestLogin).toEqual(false);
      expect(instance.loginAsGuest()).toEqual(true);
      expect(instance.guestLogin).toEqual(true);
      expect(instance.login).toHaveBeenCalled();
    });
  });

  test('.loadCharacter()', () => {
    const validClasses = ['about', 'git', 'credits'];
    const invalidClasses = ['blah', 'wrong', ''];

    instance.game = { started: true };

    instance.wrapper = {
      hasClass: (className) => instance.wrapper.className.indexOf(className) !== -1,
      attr: jest.fn().mockReturnValue(instance.wrapper.className),
      removeClass: jest.fn().mockReturnValue(instance.wrapper),
      addClass: jest.fn()
    }

    validClasses.forEach(className => {
      instance.wrapper.className = className;
      expect(instance.loadCharacter()).toEqual(true);
    });

    invalidClasses.forEach(className => {
      instance.wrapper.className = className;
      expect(instance.loadCharacter()).toEqual(false);
    });
  });
});