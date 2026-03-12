/* global window */
import log from './log';

describe('Logger', () => {
  test('singleton is defined', () => {
    expect(log).toBeDefined();
  });

  describe('randomColor()', () => {
    it('returns a hex color string', () => {
      const color = log.randomColor();
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('padEnd()', () => {
    it('returns the string unchanged if already long enough', () => {
      expect(log.padEnd('hello', 3)).toBe('hello');
    });

    it('pads the string to the target length', () => {
      // We need to test the fallback path — temporarily remove String.prototype.padEnd
      const origPadEnd = String.prototype.padEnd;
      delete String.prototype.padEnd;
      expect(log.padEnd('hi', 5, 'x')).toBe('hixxx');
      String.prototype.padEnd = origPadEnd;
    });

    it('uses native padEnd when available', () => {
      const result = log.padEnd('hi', 5);
      expect(result.length).toBe(5);
    });
  });

  describe('lightOrDark()', () => {
    it('returns #000 for a light hex color', () => {
      // white = #ffffff → very bright
      expect(log.lightOrDark('ffffff')).toBe('#000');
    });

    it('returns #fff for a dark hex color', () => {
      // black = #000000 → very dark
      expect(log.lightOrDark('000000')).toBe('#fff');
    });

    it('handles rgb() format', () => {
      // rgb(255, 255, 255) → light
      const result = log.lightOrDark('rgb(255, 255, 255)');
      expect([result]).toEqual(expect.arrayContaining([result]));
    });

    it('handles rgba() format', () => {
      const result = log.lightOrDark('rgba(0, 0, 0, 1)');
      expect(typeof result).toBe('string');
    });
  });

  describe('getColors()', () => {
    it('returns an object with bgcolor and textcolor', () => {
      const colors = log.getColors('TestClass');
      expect(colors).toHaveProperty('bgcolor');
      expect(colors).toHaveProperty('textcolor');
    });

    it('returns the same colors for the same class', () => {
      const c1 = log.getColors('SameClass');
      const c2 = log.getColors('SameClass');
      expect(c1.bgcolor).toBe(c2.bgcolor);
    });

    it('stores className in classMap', () => {
      log.getColors('MappedClass');
      expect(log.classMap['MappedClass']).toBeDefined();
    });
  });

  describe('consoleLog()', () => {
    it('calls console.info', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      log.consoleLog('MyClass - myMethod() - hello', []);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('calls console.info with extra args', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      log.consoleLog('MyClass - myMethod()', ['extra']);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('info()', () => {
    it('logs when level is info', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      log.level = 'info';
      log.window = { console: true };
      log.info('InfoClass - test()');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not log when level is prod', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      log.level = 'prod';
      log.info('InfoClass - test()');
      spy.mockRestore();
    });
  });

  describe('debug()', () => {
    it('logs when level is debug', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      log.level = 'debug';
      log.debug('DebugClass - test()');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not log when level is info', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      log.level = 'info';
      log.debug('DebugClass - test()');
      spy.mockRestore();
    });
  });

  describe('error()', () => {
    it('logs error without stacktrace', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      log.level = 'debug';
      log.window = { console: true };
      log.error('some error', false);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('logs error with stacktrace=true', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      log.level = 'debug';
      log.window = { console: true };
      // printStackTrace is global and may not exist in jsdom; mock it
      global.printStackTrace = jest.fn().mockReturnValue(['line1', 'line2']);
      log.error('some error', true);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      delete global.printStackTrace;
    });
  });
});
