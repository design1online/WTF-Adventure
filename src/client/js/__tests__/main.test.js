/* global document, window, Event */
import WTF from '../main';
import App from '../app';
import Game from '../game';
import Detect from '../utils/detect';
import { setupJestCanvasMock } from 'jest-canvas-mock';

/**
 * @test {WTF}
 */
describe('WTF', () => {
  let instance;

  beforeEach(() => {
    // Create a new instance of the WTF class for each test
    instance = new WTF();
    setupJestCanvasMock();
  });

  afterEach(() => {
    // Reset the mocks after each test
    jest.resetAllMocks();
  });

  /**
   * @test {WTF#constructor}
   */
  it('.constructor()', () => {
    expect(instance).toBeDefined();
  });

  /**
   * @test {WTF#load}
   */
  describe('.load()', () => {
    it('should create the app once the document is ready', () => {
      expect(instance.app).toEqual(null);
      instance.load();
      expect(instance.app).toBeDefined();
      expect(instance.body).toBeDefined();
      expect(instance.chatInput).toBeDefined();
    });
  });

  /**
   * @test {WTF#documentReady}
   */
  describe('.documentReady()', () => {
    it('loads', () => {
      expect(instance.app).toEqual(null);
      instance.documentReady();
      expect(instance.app).toBeDefined();
      expect(instance.body).toBeDefined();
      expect(instance.chatInput).toBeDefined();
    });

    it('should initialize the app, body, chatInput, and game', () => {
      // Mock the jQuery methods used by the documentReady() method
      global.$ = jest.fn(() => ({
        addClass: jest.fn(),
        removeAttr: jest.fn(),
        bind: jest.fn(),
      }));

      // Call the documentReady() method
      instance.documentReady();

      // Check that the app, body, chatInput, and game were initialized
      expect(instance.app).toBeDefined();
      expect(instance.body).toBeDefined();
      expect(instance.chatInput).toBeDefined();
      expect(instance.game).toBeDefined();
    });
  });

  /**
   * @test {WTF#addClasses}
   */
  describe('.addClasses()', () => {
    it('loads', () => {
      instance.documentReady();
      instance.addClasses();
      expect(instance.chatInput).toBeDefined();
      expect(instance.body[0]).toBeDefined();
    });

    it('should add the windows class to the body if the user is on Windows', () => {
      // Mock the Detect.isWindows() method
      jest.spyOn(Detect, 'isWindows').mockReturnValue(true);

      // initialize the document
      instance.documentReady();

      // Call the addClasses() method
      instance.addClasses();

      // Check that the windows class was added to the body
      expect(Detect.isWindows()).toEqual(true);
      expect(instance.body[0].classList).toContain('windows');
    });

    it('should add the opera class to the body if the user is using Opera', () => {
      // Mock the Detect.isOpera() method
      jest.spyOn(Detect, 'isOpera').mockReturnValue(true);

      // initialize the document
      instance.documentReady();

      // Call the addClasses() method
      instance.addClasses();

      // Check that the opera class was added to the body
      expect(instance.body[0].classList).toContain('opera');
    });

    it('should remove the chat input placeholder on Firefox for Android', () => {
      const chatInput = document.createElement('div');
      chatInput.setAttribute('id', 'chatInput');
      document.body.appendChild(chatInput);

      // Mock the Detect.isFirefoxAndroid() method
      jest.spyOn(Detect, 'isFirefoxAndroid').mockReturnValue(true);

      // Detect.isFirefoxAndroid()
      instance.documentReady();
      const spy = jest.spyOn(instance.chatInput, 'removeAttr');

      // Call the addClasses() method
      instance.addClasses();

      // Check that the chat input placeholder was removed
      expect(spy).toHaveBeenCalledWith('placeholder');
    });
  });

  /**
   * @test {WTF#addResizeListeners}
   */
  describe('.addResizeListeners()', () => {

    let resizeCheck;
    let resizeHandler;
    let map;

    beforeEach(() => {
      resizeCheck = document.createElement('div');
      resizeCheck.setAttribute('id', 'resizeCheck');
      document.body.appendChild(resizeCheck);
      resizeHandler = jest.fn();
      instance.app = {
        resize: resizeHandler,
        updateOrientation: jest.fn()
      };

      map = {};
      document.addEventListener = jest.fn((event, callback) => {
        map[event] = callback;
      });
    });

    afterEach(() => {
      document.body.removeChild(resizeCheck);
    });

    // beforeEach(() => {
    //   instance.app = {
    //     resize: jest.fn(),
    //     updateOrientation: jest.fn(),
    //   };
    //   document.addEventListener = jest.fn();
    //   document.removeEventListener = jest.fn();
    //   window.onresize = jest.fn();
    //   // $('#resizeCheck').bind(jest.fn());
    //   $(window).on = jest.fn();
    // });

    it('loads', () => {
      instance.documentReady();
      instance.addResizeListeners();
      expect(map.touchstart).toBeDefined();
      expect(map.touchmove).toBeDefined();
      expect(map.touchmove(new Event('test'))).toEqual(false);

      // check window orientation changes
      const updateOrientationMock = jest.spyOn(instance.app, 'updateOrientation');
      window.dispatchEvent(new Event('orientationchange'));
      expect(updateOrientationMock).toHaveBeenCalled();
    });

    it('should add event listeners for touchstart, touchmove, and resize', () => {
      instance.addResizeListeners();

      expect(map.touchstart).toBeDefined();
      expect(map.touchmove).toBeDefined();
      expect(map.touchmove(new Event('test'))).toEqual(false);
      expect(window.onresize).toBeDefined();
    });

    it('should prevent default behavior on touchmove events', () => {
      instance.addResizeListeners();

      const touchmoveEvent = new Event('touchmove', { cancelable: true });
      document.dispatchEvent(touchmoveEvent);

      expect(touchmoveEvent.defaultPrevented).toEqual(true);
    });

    it('should call the app\'s resize method when the resizeCheck element finishes transitioning', () => {
      instance.addResizeListeners();
      const transitionEvent = new Event('transitionend', { cancelable: true });
      resizeCheck.dispatchEvent(transitionEvent);

      expect(instance.app.resize.mock.calls.length).toBe(1);
    });

    it('should call the app\'s resize method when the resizeCheck element finishes a webkit transition', () => {
      instance.addResizeListeners();
      const transitionEndEvent = new Event('webkitTransitionEnd', { cancelable: true });
      resizeCheck.dispatchEvent(transitionEndEvent);

      expect(instance.app.resize.mock.calls.length).toBe(1);
    });

    it('should call the app\'s resize method when the resizeCheck element finishes an opera transition', () => {
      instance.addResizeListeners();
      const onTransitionEnd = new Event('oTransitionEnd', { cancelable: true });
      resizeCheck.dispatchEvent(onTransitionEnd);

      expect(instance.app.resize.mock.calls.length).toBe(1);
    });

    it('should call the app\'s updateOrientation method when the device orientation changes', () => {
      instance.addResizeListeners();
      window.dispatchEvent(new Event('orientationchange'));

      expect(instance.app.updateOrientation.mock.calls.length).toBe(1);
    });
  });

  /**
   * @test {WTF#initGame}
   */
  describe('.initGame()', () => {
    it('loads', () => {
      expect(instance.app).toEqual(null);
      instance.documentReady();
      instance.initGame();
      expect(instance.app.readyCallback).toBeDefined();
    });

    it('should create a new instance of Game and set it as the app\'s game', async () => {
      instance.documentReady();

      const onReadySpy = jest.spyOn(instance.app, 'onReady');
      const setGameSpy = jest.spyOn(instance.app, 'setGame');
      instance.initGame();

      expect(instance.app.onReady).toEqual(instance.app.onReady);
      expect(instance.app.sendStatus).toEqual(instance.app.sendStatus);
      expect(onReadySpy).toHaveBeenCalled();
      expect(instance.app.readyCallback).toBeDefined();
      instance.app.readyCallback();
      expect(setGameSpy).toHaveBeenCalled();
      expect(window.wtf).toBeDefined();
    });
  });
});
