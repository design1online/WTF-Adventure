// mock the window.scrollTo function
global.scrollTo = jest.fn();

// changes the logging level displayed in tests
global.debugLevel = 'none'; // none|debug|info|prod
