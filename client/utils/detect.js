/* global navigator, window */
const userAgentContains = string => navigator.userAgent.indexOf(string) !== -1;

const Detect = {
  isIpad: () => /ipad/i.test(navigator.userAgent.toLowerCase()),
  isAndroid: () => /Android/i.test(navigator.userAgent),
  isWindows: () => userAgentContains('Windows'),
  isChromeOnWindows: () => userAgentContains('Chrome') && userAgentContains('Windows'),
  isCanaryOnWindows: () => userAgentContains('Chrome/52') && userAgentContains('Windows'),
  isEdgeOnWindows: () => userAgentContains('Edge') && userAgentContains('Windows'),
  isFirefox: () => userAgentContains('Firefox'),
  isSafari: () => userAgentContains('Safari') && !userAgentContains('Chrome'),
  isOpera: () => userAgentContains('Opera'),
  isFirefoxAndroid: () => userAgentContains('Android') && userAgentContains('Firefox'),
  isTablet: (screenWidth) => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAppleTablet = /ipad/i.test(userAgent);
    const isAndroidTablet = /android/i.test(userAgent);
    return (isAppleTablet || isAndroidTablet) && screenWidth >= 640;
  },

  iOSVersion: () => {
    if (typeof window !== "undefined") {
      if (window.MSStream) {
        // There is some iOS in Windows Phone...
        // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
        return '';
      }
    }

    const match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);

    let version;

    if (match !== undefined && match !== null) {
      version = [
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3] || 0, 10),
      ];
      return parseFloat(version.join('.'));
    }

    return '';
  },

  androidVersion: () => {
    const userAgent = navigator.userAgent.split('Android');
    let version;

    if (userAgent.length > 1) {
      version = userAgent[1].split(';')[0]; // eslint-disable-line
    }

    return version;
  },

  isAppleDevice: () => {
    const devices = [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ];

    if (navigator.platform) {
      while (devices.length) {
        navigator.platform = devices.pop();
        if (navigator.platform) {
          return true;
        }
      }
    }

    return false;
  },
};

export default Detect;
