// mock the window.scrollTo function
global.scrollTo = jest.fn();

// changes the logging level displayed in tests
global.debugLevel = 'none'; // none|debug|info|prod

// setup the game canvases for our tests so we don't have
// to keep adding them in
const setupCanvas = (canvasName) => {
  const newCanvas = global.document.createElement('canvas');
  newCanvas.setAttribute('id', canvasName);
  global.document.body.appendChild(newCanvas);
};

const gameCanvases = [
  'background',
  'foreground',
  'textCanvas',
  'entities',
  'cursor',
];

gameCanvases.forEach(canvas => setupCanvas(canvas));
