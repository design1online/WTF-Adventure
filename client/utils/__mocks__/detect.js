/**
 * Jest mock for the Detect utility, providing stub browser detection methods
 */
const Detect = {
  isIpad: jest.fn().mockReturnValue(false),
  isAndroid: jest.fn().mockReturnValue(false),
  isWindows: jest.fn().mockReturnValue(true),
  isChromeOnWindows: jest.fn().mockReturnValue(false),
  isCanaryOnWindows: jest.fn().mockReturnValue(false),
  isEdgeOnWindows: jest.fn().mockReturnValue(false),
  isFirefox: jest.fn().mockReturnValue(false),
  isSafari: jest.fn().mockReturnValue(false),
  isOpera: jest.fn().mockReturnValue(true),
  isFirefoxAndroid: jest.fn().mockReturnValue(true),
  isTablet: jest.fn().mockReturnValue(false),
  iOSVersion: jest.fn().mockReturnValue(''),
  androidVersion: jest.fn().mockReturnValue(undefined),
  isAppleDevice: jest.fn().mockReturnValue(false),
};

export default Detect;
