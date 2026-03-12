jest.mock('../lib/log', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../utils/modules', () => ({
  __esModule: true,
  default: {
    AudioTypes: {
      Music: 0,
      SFX: 1,
    },
  },
}));

import Audio from './audio';

// Factory to create a fresh mock audio element
const createMockAudioElement = () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  load: jest.fn(),
  cloneNode: jest.fn(function () { return createMockAudioElement(); }),
  preload: '',
  autobuffer: false,
  src: '',
  volume: 0,
  currentTime: 0,
  readyState: 4,
  ended: false,
  paused: true,
  fadingIn: null,
  fadingOut: null,
  loop: false,
});

describe('Audio', () => {
  let audio;
  let mockGame;
  let mockAudioElement;

  beforeEach(() => {
    jest.useFakeTimers();

    mockAudioElement = createMockAudioElement();

    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'audio') return mockAudioElement;
      return document.createElement.wrappedJSObject
        ? document.createElement.wrappedJSObject(tag)
        : {};
    });

    mockGame = {
      renderer: {
        mobile: false,
      },
      storage: {
        data: {
          settings: {
            sfx: 50,
            music: 80,
            soundEnabled: true,
          },
        },
      },
    };

    audio = new Audio(mockGame);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('sets game reference', () => {
      expect(audio.game).toBe(mockGame);
    });

    test('initializes audibles as empty object', () => {
      expect(audio.audibles).toEqual({});
    });

    test('sets format to mp3', () => {
      expect(audio.format).toBe('mp3');
    });

    test('initializes song as null', () => {
      expect(audio.song).toBeNull();
    });

    test('initializes songName as null', () => {
      expect(audio.songName).toBeNull();
    });

    test('sets enabled to true', () => {
      expect(audio.enabled).toBe(true);
    });

    test('calls loadAudio on construction', () => {
      expect(audio.music).toBeDefined();
      expect(audio.sfx).toBeDefined();
    });
  });

  describe('loadAudio', () => {
    test('loads music tracks as false', () => {
      expect(audio.music.codingroom).toBe(false);
      expect(audio.music.smalltown).toBe(false);
      expect(audio.music.village).toBe(false);
      expect(audio.music.beach).toBe(false);
      expect(audio.music.spookyship).toBe(false);
      expect(audio.music.meadowofthepast).toBe(false);
    });

    test('loads sfx tracks as false', () => {
      expect(audio.sfx.loot).toBe(false);
      expect(audio.sfx.hit1).toBe(false);
      expect(audio.sfx.hit2).toBe(false);
      expect(audio.sfx.hurt).toBe(false);
      expect(audio.sfx.heal).toBe(false);
      expect(audio.sfx.chat).toBe(false);
      expect(audio.sfx.death).toBe(false);
      expect(audio.sfx.achievement).toBe(false);
      expect(audio.sfx['npc-end']).toBe(false);
    });
  });

  describe('parse', () => {
    test('creates an audio element with the correct src', () => {
      audio.parse('/audio/music/', 'village', 1);
      expect(mockAudioElement.src).toBe('/audio/music/village.mp3');
    });

    test('adds parsed audio to audibles', () => {
      audio.parse('/audio/sfx/', 'loot', 1);
      expect(audio.audibles['loot']).toBeDefined();
      expect(audio.audibles['loot'].length).toBe(1);
    });

    test('clones node for multiple channels', () => {
      audio.parse('/audio/sfx/', 'loot', 3);
      expect(audio.audibles['loot'].length).toBe(3);
      expect(mockAudioElement.cloneNode).toHaveBeenCalledTimes(2);
    });

    test('sets music flag to true when name is in music', () => {
      audio.parse('/audio/music/', 'village', 1);
      expect(audio.music['village']).toBe(true);
    });

    test('sets sfx flag to true when name is in sfx', () => {
      audio.parse('/audio/sfx/', 'loot', 1);
      expect(audio.sfx['loot']).toBe(true);
    });

    test('calls callback on canplaythrough event', () => {
      const callback = jest.fn();
      audio.parse('/audio/music/', 'village', 1, callback);

      const canPlayCall = mockAudioElement.addEventListener.mock.calls.find(
        call => call[0] === 'canplaythrough',
      );
      expect(canPlayCall).toBeDefined();

      const handler = canPlayCall[1];
      const mockContext = { removeEventListener: jest.fn() };
      handler.call(mockContext);

      expect(callback).toHaveBeenCalled();
    });

    test('sets audibles to null on error event', () => {
      audio.parse('/audio/music/', 'village', 1);

      const errorCall = mockAudioElement.addEventListener.mock.calls.find(
        call => call[0] === 'error',
      );
      expect(errorCall).toBeDefined();

      errorCall[1]();
      expect(audio.audibles['village']).toBeNull();
    });

    test('sets preload and autobuffer properties', () => {
      audio.parse('/audio/music/', 'village', 1);
      expect(mockAudioElement.preload).toBe('auto');
      expect(mockAudioElement.autobuffer).toBe(true);
    });

    test('calls load on the audio element', () => {
      audio.parse('/audio/music/', 'village', 1);
      expect(mockAudioElement.load).toHaveBeenCalled();
    });
  });

  describe('fileExists', () => {
    test('returns true for a music track', () => {
      expect(audio.fileExists('village')).toBe(true);
    });

    test('returns true for an sfx track', () => {
      expect(audio.fileExists('loot')).toBe(true);
    });

    test('returns false for unknown track', () => {
      expect(audio.fileExists('nonexistent')).toBe(false);
    });
  });

  describe('get', () => {
    test('returns null when audible does not exist', () => {
      expect(audio.get('village')).toBeNull();
    });

    test('returns the first audible when none are ended or paused', () => {
      const sound = createMockAudioElement();
      sound.ended = false;
      sound.paused = false;
      audio.audibles['village'] = [sound];

      expect(audio.get('village')).toBe(sound);
    });

    test('returns paused audible', () => {
      const sound = createMockAudioElement();
      sound.ended = false;
      sound.paused = true;
      audio.audibles['village'] = [sound];

      expect(audio.get('village')).toBe(sound);
    });

    test('resets currentTime when audible is ended', () => {
      const sound = createMockAudioElement();
      sound.ended = true;
      sound.currentTime = 99;
      audio.audibles['village'] = [sound];

      audio.get('village');
      expect(sound.currentTime).toBe(0);
    });
  });

  describe('getMusic', () => {
    test('returns an object with sound and name', () => {
      const result = audio.getMusic('village');
      expect(result).toHaveProperty('name', 'village');
      expect(result).toHaveProperty('sound');
    });
  });

  describe('isEnabled', () => {
    test('returns true when sound is enabled and audio is enabled', () => {
      expect(audio.isEnabled()).toBe(true);
    });

    test('returns false when soundEnabled is false', () => {
      mockGame.storage.data.settings.soundEnabled = false;
      expect(audio.isEnabled()).toBe(false);
    });

    test('returns false when audio.enabled is false', () => {
      audio.enabled = false;
      expect(audio.isEnabled()).toBe(false);
    });
  });

  describe('getSFXVolume', () => {
    test('returns sfx volume divided by 100', () => {
      expect(audio.getSFXVolume()).toBe(0.5);
    });
  });

  describe('getMusicVolume', () => {
    test('returns music volume divided by 100', () => {
      expect(audio.getMusicVolume()).toBe(0.8);
    });
  });

  describe('setSongVolume', () => {
    test('sets volume on the song', () => {
      const mockSong = createMockAudioElement();
      audio.song = mockSong;
      audio.setSongVolume(0.5);
      expect(mockSong.volume).toBe(0.5);
    });
  });

  describe('play', () => {
    test('returns false when audio is disabled', () => {
      mockGame.storage.data.settings.soundEnabled = false;
      const result = audio.play(0, 'village');
      expect(result).toBe(false);
    });

    test('returns false when file does not exist', () => {
      const result = audio.play(0, 'nonexistent');
      expect(result).toBe(false);
    });

    test('returns false for unknown type', () => {
      const mockSong = createMockAudioElement();
      audio.audibles['village'] = [mockSong];
      const result = audio.play(99, 'village');
      expect(result).toBe(false);
    });

    test('plays Music type when song is available', () => {
      const mockSong = createMockAudioElement();
      audio.audibles['village'] = [mockSong];
      audio.song = null;

      const result = audio.play(0, 'village');
      expect(result).toBe(true);
      expect(mockSong.play).toHaveBeenCalled();
    });

    test('returns false for Music when song is null after get', () => {
      // village is in the music list but audibles is not set, so get() returns null
      const result = audio.play(0, 'village');
      expect(result).toBe(false);
    });

    test('plays SFX type when audible is available', () => {
      const mockSong = createMockAudioElement();
      audio.sfx['loot'] = true;
      audio.audibles['loot'] = [mockSong];

      const result = audio.play(1, 'loot');
      expect(result).toBe(true);
      expect(mockSong.play).toHaveBeenCalled();
    });

    test('calls parse for SFX when sfx is not yet loaded', () => {
      const parseSpy = jest.spyOn(audio, 'parse');
      // loot is in sfx list but sfx[loot] is false - parse will be called
      // audibles will still be null after parse runs (mocked element won't help song)
      audio.play(1, 'loot');
      expect(parseSpy).toHaveBeenCalledWith('/audio/sfx/', 'loot', 4);
    });

    test('returns false for SFX when song is null after parse', () => {
      // loot sfx is false, parse will be called but song stays null
      const result = audio.play(1, 'loot');
      expect(result).toBe(false);
    });
  });

  describe('reset', () => {
    test('returns false when song is not set', () => {
      audio.song = null;
      expect(audio.reset()).toBe(false);
    });

    test('pauses and resets currentTime when song is set', () => {
      const mockSong = createMockAudioElement();
      mockSong.readyState = 4;
      audio.song = mockSong;

      const result = audio.reset();
      expect(result).toBe(true);
      expect(mockSong.pause).toHaveBeenCalled();
      expect(mockSong.currentTime).toBe(0);
    });

    test('updates song reference when passed a song argument', () => {
      const mockSong = createMockAudioElement();
      mockSong.readyState = 4;
      const newSong = createMockAudioElement();
      newSong.readyState = 4;
      audio.song = mockSong;

      audio.reset(newSong);
      expect(audio.song).toBe(newSong);
    });
  });

  describe('stop', () => {
    test('returns false when no song is playing', () => {
      audio.song = null;
      expect(audio.stop()).toBe(false);
    });

    test('returns true and calls fadeOut when song is playing', () => {
      const mockSong = createMockAudioElement();
      mockSong.volume = 0.5;
      mockSong.fadingOut = null;
      mockSong.fadingIn = null;
      audio.song = mockSong;

      const result = audio.stop();
      expect(result).toBe(true);
    });
  });

  describe('fadeIn', () => {
    test('returns false when song is null', () => {
      audio.song = null;
      expect(audio.fadeIn()).toBe(false);
    });

    test('returns false when song is already fading in', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = 123;
      audio.song = mockSong;
      expect(audio.fadeIn()).toBe(false);
    });

    test('returns true and sets up interval when song is set', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      audio.song = mockSong;

      const result = audio.fadeIn();
      expect(result).toBe(true);
      expect(mockSong.fadingIn).not.toBeNull();
    });

    test('increments volume on interval tick', () => {
      const mockSong = createMockAudioElement();
      mockSong.volume = 0;
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      audio.song = mockSong;

      audio.fadeIn();
      jest.advanceTimersByTime(100);

      expect(mockSong.volume).toBeCloseTo(0.02);
    });

    test('stops fading in and sets to music volume when volume reaches threshold', () => {
      const mockSong = createMockAudioElement();
      mockSong.volume = 0.79;
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      audio.song = mockSong;

      audio.fadeIn();
      jest.advanceTimersByTime(100);

      expect(mockSong.fadingIn).toBeNull();
      expect(mockSong.volume).toBe(audio.getMusicVolume());
    });
  });

  describe('fadeOut', () => {
    test('returns false when song is null', () => {
      audio.song = null;
      expect(audio.fadeOut()).toBe(false);
    });

    test('returns false when song is already fading out', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingOut = 123;
      audio.song = mockSong;
      expect(audio.fadeOut()).toBe(false);
    });

    test('returns true and sets up interval when song is set', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      mockSong.volume = 0.5;
      audio.song = mockSong;

      const result = audio.fadeOut();
      expect(result).toBe(true);
      expect(mockSong.fadingOut).not.toBeNull();
    });

    test('decrements volume on interval tick', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      mockSong.volume = 0.5;
      audio.song = mockSong;

      audio.fadeOut();
      jest.advanceTimersByTime(100);

      expect(mockSong.volume).toBeCloseTo(0.42);
    });

    test('calls callback and zeroes volume when volume drops to threshold', () => {
      const callback = jest.fn();
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      mockSong.volume = 0.05;
      audio.song = mockSong;

      audio.fadeOut(callback);
      jest.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalled();
      expect(mockSong.volume).toBe(0);
    });
  });

  describe('fadeSongOut', () => {
    test('returns false when no song', () => {
      audio.song = null;
      expect(audio.fadeSongOut()).toBe(false);
    });

    test('returns true and sets song to null', () => {
      const mockSong = createMockAudioElement();
      mockSong.volume = 0.5;
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      audio.song = mockSong;

      const result = audio.fadeSongOut();
      expect(result).toBe(true);
      expect(audio.song).toBeNull();
    });
  });

  describe('clearFadeIn', () => {
    test('returns false when fadingIn is null', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      audio.song = mockSong;
      expect(audio.clearFadeIn()).toBe(false);
    });

    test('returns true and clears interval when fadingIn is set', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = setInterval(() => {}, 1000);
      audio.song = mockSong;

      expect(audio.clearFadeIn()).toBe(true);
      expect(mockSong.fadingIn).toBeNull();
    });
  });

  describe('clearFadeOut', () => {
    test('returns false when fadingOut is null', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingOut = null;
      audio.song = mockSong;
      expect(audio.clearFadeOut()).toBe(false);
    });

    test('returns true and clears interval when fadingOut is set', () => {
      const mockSong = createMockAudioElement();
      mockSong.fadingOut = setInterval(() => {}, 1000);
      audio.song = mockSong;

      expect(audio.clearFadeOut()).toBe(true);
      expect(mockSong.fadingOut).toBeNull();
    });
  });

  describe('update', () => {
    test('returns false when audio is disabled', () => {
      mockGame.storage.data.settings.soundEnabled = false;
      expect(audio.update()).toBe(false);
    });

    test('returns true when enabled and no active song', () => {
      audio.song = null;
      audio.songName = null;
      expect(audio.update()).toBe(true);
    });

    test('resets song on mobile when song and songName result in different song', () => {
      mockGame.renderer.mobile = true;
      const mockSong = createMockAudioElement();
      mockSong.readyState = 4;
      mockSong.name = 'old';
      audio.song = mockSong;
      audio.songName = 'village';
      // getMusic('village') returns { sound: null, name: 'village' }
      // song.name is undefined, so they differ -> reset is called
      audio.update();
      expect(mockSong.pause).toHaveBeenCalled();
    });

    test('calls fadeSongOut on desktop when song and songName differ', () => {
      mockGame.renderer.mobile = false;
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      mockSong.volume = 0.5;
      mockSong.name = 'old';
      audio.song = mockSong;
      audio.songName = 'village';

      const fadeSongOutSpy = jest.spyOn(audio, 'fadeSongOut');
      audio.update();
      // fadeSongOut should have been called to fade out the current song
      expect(fadeSongOutSpy).toHaveBeenCalled();
    });

    test('resets song on mobile when there is no matching new song (songName is null)', () => {
      mockGame.renderer.mobile = true;
      const mockSong = createMockAudioElement();
      mockSong.readyState = 4;
      audio.song = mockSong;
      audio.songName = null;
      // getMusic(null) returns { sound: null, name: null }
      // song and song.name differ from null => on mobile, reset is called

      // Actually when songName is null, getMusic returns { sound: null, name: null }
      // song is not null, song.name is undefined != null -> enters the if branch
      // on mobile -> reset(this.song) is called
      audio.update();
      expect(mockSong.pause).toHaveBeenCalled();
    });

    test('calls fadeSongOut on desktop when no new song', () => {
      mockGame.renderer.mobile = false;
      const mockSong = createMockAudioElement();
      mockSong.fadingIn = null;
      mockSong.fadingOut = null;
      mockSong.volume = 0.5;
      audio.song = mockSong;
      audio.songName = null;

      audio.update();
      expect(audio.song).toBeNull();
    });
  });
});
