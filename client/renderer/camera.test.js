import Camera from './camera';
import { Modules } from '../utils/modules';

describe('Camera', () => {
  let camera;
  let mockRenderer;

  beforeEach(() => {
    mockRenderer = {
      getUpscale: jest.fn().mockReturnValue(2),
      tileSize: 16,
      verifyCentration: jest.fn(),
    };
    camera = new Camera(mockRenderer);
  });

  test('constructor sets default position', () => {
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);
    expect(camera.offset).toBe(0.5);
    expect(camera.centered).toBe(true);
  });

  test('update() calculates gridWidth and gridHeight', () => {
    camera.update();
    expect(camera.gridWidth).toBe(30); // 15 * factor(2)
    expect(camera.gridHeight).toBe(16); // 8 * factor(2)
  });

  test('setPosition() updates x, y and grid coords', () => {
    camera.setPosition(32, 48);
    expect(camera.x).toBe(32);
    expect(camera.y).toBe(48);
    expect(camera.gridX).toBe(2); // floor(32/16)
    expect(camera.gridY).toBe(3); // floor(48/16)
  });

  test('setGridPosition() updates grid and pixel coords', () => {
    camera.setGridPosition(3, 4);
    expect(camera.gridX).toBe(3);
    expect(camera.gridY).toBe(4);
    expect(camera.x).toBe(48);
    expect(camera.y).toBe(64);
  });

  test('clip() rounds to nearest tile', () => {
    camera.x = 24; // 24/16 = 1.5 => rounds to 2
    camera.y = 8;  // 8/16 = 0.5 => rounds to 1
    camera.clip();
    expect(camera.gridX).toBe(2);
    expect(camera.gridY).toBe(1);
  });

  test('center() enables centering and calls verifyCentration', () => {
    camera.centered = false;
    camera.player = { x: 0, y: 0 };
    camera.center();
    expect(camera.centered).toBe(true);
    expect(mockRenderer.verifyCentration).toHaveBeenCalled();
  });

  test('center() does nothing if already centered', () => {
    camera.centered = true;
    camera.center();
    expect(mockRenderer.verifyCentration).not.toHaveBeenCalled();
  });

  test('decenter() disables centering and calls verifyCentration', () => {
    camera.decenter();
    expect(camera.centered).toBe(false);
    expect(mockRenderer.verifyCentration).toHaveBeenCalled();
  });

  test('decenter() does nothing if already decentered', () => {
    camera.centered = false;
    camera.decenter();
    expect(mockRenderer.verifyCentration).not.toHaveBeenCalled();
  });

  test('setPlayer() stores player and centres', () => {
    const player = { x: 32, y: 64 };
    camera.setPlayer(player);
    expect(camera.player).toBe(player);
  });

  test('handlePanning() does nothing when not panning', () => {
    camera.panning = false;
    const prevX = camera.x;
    camera.handlePanning(Modules.Keys.Up);
    expect(camera.x).toBe(prevX);
  });

  test('handlePanning() moves camera when panning', () => {
    camera.panning = true;
    camera.x = 10;
    camera.y = 10;
    camera.handlePanning(Modules.Keys.Up);
    expect(camera.y).toBe(9);
    camera.handlePanning(Modules.Keys.Down);
    expect(camera.y).toBe(10);
    camera.handlePanning(Modules.Keys.Left);
    expect(camera.x).toBe(9);
    camera.handlePanning(Modules.Keys.Right);
    expect(camera.x).toBe(10);
  });

  test('zone() moves camera by gridHeight/Width', () => {
    camera.gridX = 10;
    camera.gridY = 10;
    camera.zone(Modules.Orientation.Up);
    expect(camera.gridY).toBe(10 - camera.gridHeight + 2);
  });

  test('forEachVisiblePosition() iterates visible tiles', () => {
    camera.gridX = 0;
    camera.gridY = 0;
    camera.gridWidth = 3;
    camera.gridHeight = 3;
    const positions = [];
    camera.forEachVisiblePosition((x, y) => positions.push([x, y]));
    expect(positions.length).toBeGreaterThan(0);
  });
});
