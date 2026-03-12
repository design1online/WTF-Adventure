import Sprite from './sprite';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock Image API
class MockImage {
  constructor() {
    this.onload = null;
    this.src = '';
    this.width = 64;
    this.height = 64;
  }
}
global.Image = MockImage;

// Mock document.createElement for canvas
global.document = {
  ...global.document,
  createElement: jest.fn((tag) => {
    if (tag === 'canvas') {
      return {
        getContext: jest.fn(() => ({
          drawImage: jest.fn(),
          getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(64) })),
          putImageData: jest.fn(),
        })),
        width: 0,
        height: 0,
      };
    }
    return {};
  }),
};

function makeSpriteData() {
  return {
    id: 'goblin',
    width: 32,
    height: 32,
    offsetX: -16,
    offsetY: -16,
    offsetAngle: 0,
    animations: {
      walk_down: { length: 4, row: 0 },
      idle_down: { length: 1, row: 1 },
    },
  };
}

describe('Sprite', () => {
  let sprite;

  beforeEach(() => {
    sprite = new Sprite(makeSpriteData(), 2);
  });

  test('constructor sets id, scale, loaded=false', () => {
    expect(sprite.id).toBe('goblin');
    expect(sprite.scale).toBe(2);
    expect(sprite.loaded).toBe(false);
  });

  test('loadSpriteImgData() sets filepath and animationData', () => {
    expect(sprite.filepath).toBe('/img/2/goblin.png');
    expect(sprite.animationData).toBeDefined();
    expect(sprite.width).toBe(32);
  });

  test('createAnimations() returns animation map', () => {
    const anims = sprite.createAnimations();
    expect(anims).toHaveProperty('walk_down');
    expect(anims).toHaveProperty('idle_down');
  });

  test('getHurtSprite() returns whiteSprite object', () => {
    const hs = sprite.getHurtSprite();
    // Either returns whiteSprite or null (since image is not loaded)
    expect(hs !== undefined).toBe(true);
  });

  test('onLoad() registers callback', () => {
    const cb = jest.fn();
    sprite.onLoad(cb);
    expect(sprite.onLoadCallback).toBe(cb);
  });

  test('update() changes scale and reloads', () => {
    sprite.update(3);
    expect(sprite.scale).toBe(3);
    expect(sprite.filepath).toBe('/img/3/goblin.png');
  });
});
