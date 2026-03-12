import Pointer from './pointer';

describe('Pointer', () => {
  let pointer;
  let mockElement;

  beforeEach(() => {
    jest.useFakeTimers();
    mockElement = {
      css: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    };
    pointer = new Pointer('npc-1', mockElement, 1);
  });

  afterEach(() => {
    jest.useRealTimers();
    if (pointer.blinkInterval) {
      clearInterval(pointer.blinkInterval);
    }
  });

  test('constructor sets properties', () => {
    expect(pointer.id).toBe('npc-1');
    expect(pointer.element).toBe(mockElement);
    expect(pointer.type).toBe(1);
    expect(pointer.visible).toBe(true);
    expect(pointer.x).toBe(-1);
    expect(pointer.y).toBe(-1);
  });

  test('loadPointer() starts blink interval', () => {
    expect(pointer.blinkInterval).not.toBeNull();
  });

  test('show() sets display to block', () => {
    pointer.show();
    expect(mockElement.css).toHaveBeenCalledWith('display', 'block');
  });

  test('hide() sets display to none', () => {
    pointer.hide();
    expect(mockElement.css).toHaveBeenCalledWith('display', 'none');
  });

  test('setPosition() updates x and y', () => {
    pointer.setPosition(50, 100);
    expect(pointer.x).toBe(50);
    expect(pointer.y).toBe(100);
  });

  test('destroy() clears interval and removes element', () => {
    pointer.destroy();
    expect(mockElement.remove).toHaveBeenCalled();
  });

  test('blink interval toggles visibility', () => {
    pointer.visible = true;
    jest.advanceTimersByTime(600);
    // hide was called
    expect(mockElement.css).toHaveBeenCalledWith('display', 'none');
  });
});
