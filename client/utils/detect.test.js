import Detect from './detect';

function setUserAgent(ua) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

function setAppVersion(av) {
  Object.defineProperty(navigator, 'appVersion', {
    value: av,
    configurable: true,
  });
}

describe('Detect', () => {
  afterEach(() => {
    // restore
    Object.defineProperty(navigator, 'userAgent', {
      value: '',
      configurable: true,
    });
  });

  test('isIpad() returns true for iPad user agent', () => {
    setUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
    expect(Detect.isIpad()).toBe(true);
  });

  test('isIpad() returns false for non-iPad', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0)');
    expect(Detect.isIpad()).toBe(false);
  });

  test('isAndroid() returns true for Android', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 9; Pixel 3)');
    expect(Detect.isAndroid()).toBe(true);
  });

  test('isAndroid() returns false for non-Android', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0)');
    expect(Detect.isAndroid()).toBe(false);
  });

  test('isWindows() returns true for Windows UA', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    expect(Detect.isWindows()).toBe(true);
  });

  test('isWindows() returns false for non-Windows', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
    expect(Detect.isWindows()).toBe(false);
  });

  test('isChromeOnWindows() returns true for Chrome+Windows', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0) Chrome/100.0');
    expect(Detect.isChromeOnWindows()).toBe(true);
  });

  test('isFirefox() returns true for Firefox', () => {
    setUserAgent('Mozilla/5.0 Firefox/100.0');
    expect(Detect.isFirefox()).toBe(true);
  });

  test('isSafari() returns true for Safari without Chrome', () => {
    setUserAgent('Mozilla/5.0 (Macintosh) Safari/537.36');
    expect(Detect.isSafari()).toBe(true);
  });

  test('isSafari() returns false when Chrome is also in UA', () => {
    setUserAgent('Mozilla/5.0 Chrome/100 Safari/537');
    expect(Detect.isSafari()).toBe(false);
  });

  test('isOpera() returns true for Opera', () => {
    setUserAgent('Opera/9.80');
    expect(Detect.isOpera()).toBe(true);
  });

  test('isFirefoxAndroid() returns true for Firefox on Android', () => {
    setUserAgent('Mozilla/5.0 (Android 9) Firefox/100.0');
    expect(Detect.isFirefoxAndroid()).toBe(true);
  });

  test('isTablet() returns true for iPad with wide screen', () => {
    setUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
    expect(Detect.isTablet(800)).toBe(true);
  });

  test('isTablet() returns false for narrow screen', () => {
    setUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
    expect(Detect.isTablet(320)).toBe(false);
  });

  test('androidVersion() returns version string for Android UA', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 9; Pixel)');
    const v = Detect.androidVersion();
    expect(v).toBeDefined();
    expect(v).toContain('9');
  });

  test('androidVersion() returns undefined for non-Android', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0)');
    expect(Detect.androidVersion()).toBeUndefined();
  });

  test('iOSVersion() returns empty string when no match', () => {
    setAppVersion('5.0 (Windows NT 10.0)');
    expect(Detect.iOSVersion()).toBe('');
  });

  test('iOSVersion() parses OS version', () => {
    setAppVersion('5.0 (iPhone; CPU iPhone OS 14_4_0 like Mac OS X)');
    const v = Detect.iOSVersion();
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThan(0);
  });

  test('isAppleDevice() returns true when platform matches', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'iPhone',
      configurable: true,
      writable: true,
    });
    expect(Detect.isAppleDevice()).toBe(true);
  });
});
