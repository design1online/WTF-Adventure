/**
 * Jest mock for the Detect utility, providing stub browser detection methods
 */
const Detect = {
  isWindows: jest.fn().mockReturnValue(true),
  isOpera: jest.fn().mockReturnValue(true),
  isFirefoxAndroid: jest.fn().mockReturnValue(true),
};

export default Detect;
