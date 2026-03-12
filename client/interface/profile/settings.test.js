import Settings from './settings';

jest.mock('jquery', () => {
  const mockEl = {
    find: jest.fn().mockReturnThis(),
    css: jest.fn().mockReturnThis(),
    click: jest.fn().mockReturnThis(),
    fadeIn: jest.fn().mockReturnThis(),
    fadeOut: jest.fn().mockReturnThis(),
    prepend: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    val: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    removeClass: jest.fn().mockReturnThis(),
    addClass: jest.fn().mockReturnThis(),
    hasClass: jest.fn().mockReturnValue(false),
    on: jest.fn().mockReturnThis(),
    change: jest.fn().mockReturnThis(),
    blur: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    focus: jest.fn().mockReturnThis(),
    empty: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    toggleClass: jest.fn().mockReturnThis(),
    dblclick: jest.fn().mockReturnThis(),
    width: jest.fn().mockReturnValue(100),
    height: jest.fn().mockReturnValue(100),
    remove: jest.fn().mockReturnThis(),
    length: 0,
  };
  const $ = jest.fn(() => mockEl);
  $.fn = mockEl;
  return $;
});

describe('Settings', () => {
  let settings;
  let mockGame;

  const makeStorage = () => ({
    data: {
      settings: {
        music: 50,
        sfx: 50,
        brightness: 100,
        soundEnabled: true,
        centerCamera: true,
        debug: false,
        autoCentre: false,
        showNames: true,
        showLevels: true,
      },
      intensity: 0.5,
    },
    save: jest.fn(),
  });

  beforeEach(() => {
    mockGame = {
      audio: { song: null, reset: jest.fn(), update: jest.fn() },
      storage: makeStorage(),
      renderer: {
        getDrawingScale: jest.fn().mockReturnValue(2),
        adjustBrightness: jest.fn(),
        camera: { decenter: jest.fn(), center: jest.fn(), centered: true },
        debugging: false,
        autoCentre: false,
        drawNames: true,
        drawLevels: true,
        verifyCentration: jest.fn(),
      },
      interface: { hideAll: jest.fn() },
      client: { updateRange: jest.fn() },
    };
    settings = new Settings(mockGame);
  });

  test('constructor stores game reference', () => {
    expect(settings.game).toBe(mockGame);
  });

  test('constructor stores audio reference', () => {
    expect(settings.audio).toBe(mockGame.audio);
  });

  test('constructor stores storage reference', () => {
    expect(settings.storage).toBe(mockGame.storage);
  });

  test('constructor stores renderer reference', () => {
    expect(settings.renderer).toBe(mockGame.renderer);
  });

  test('constructor marks loaded as true after loadSettings', () => {
    expect(settings.loaded).toBe(true);
  });

  test('show() calls fadeIn on body', () => {
    settings.show();
    expect(settings.body.fadeIn).toHaveBeenCalledWith('slow');
  });

  test('hide() calls fadeOut on body', () => {
    settings.hide();
    expect(settings.body.fadeOut).toHaveBeenCalledWith('fast');
  });

  test('getMusicLevel() returns stored value', () => {
    expect(settings.getMusicLevel()).toBe(50);
  });

  test('getSFXLevel() returns stored value', () => {
    expect(settings.getSFXLevel()).toBe(50);
  });

  test('getBrightness() returns stored value', () => {
    expect(settings.getBrightness()).toBe(100);
  });

  test('getSound() returns stored value', () => {
    expect(settings.getSound()).toBe(true);
  });

  test('getCamera() returns stored value', () => {
    expect(settings.getCamera()).toBe(true);
  });

  test('setMusicLevel() persists value', () => {
    settings.setMusicLevel(75);
    expect(mockGame.storage.data.settings.music).toBe(75);
    expect(mockGame.storage.save).toHaveBeenCalled();
  });

  test('setSFXLevel() persists value', () => {
    settings.setSFXLevel(30);
    expect(mockGame.storage.data.settings.sfx).toBe(30);
    expect(mockGame.storage.save).toHaveBeenCalled();
  });

  test('setBrightness() persists value', () => {
    settings.setBrightness(80);
    expect(mockGame.storage.data.settings.brightness).toBe(80);
    expect(mockGame.storage.save).toHaveBeenCalled();
  });

  test('setIntensity() converts and persists value', () => {
    settings.setIntensity(5);
    expect(mockGame.storage.data.intensity).toBeCloseTo(0.5);
    expect(mockGame.storage.save).toHaveBeenCalled();
  });

  test('getIntensity() converts stored intensity to slider value', () => {
    expect(settings.getIntensity()).toBeCloseTo(5);
  });

  test('loadSettings() does not run again when already loaded', () => {
    const saveCallsBefore = mockGame.storage.save.mock.calls.length;
    settings.loadSettings();
    expect(mockGame.storage.save.mock.calls.length).toBe(saveCallsBefore);
  });
});
