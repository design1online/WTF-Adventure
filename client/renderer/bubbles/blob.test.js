import Blob from './blob';
import $ from 'jquery';

jest.mock('jquery', () => {
  const mockEl = {
    css: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
  };
  const jq = jest.fn(() => mockEl);
  jq._mockEl = mockEl;
  return jq;
});

describe('Blob', () => {
  let blob;
  let mockElement;

  beforeEach(() => {
    mockElement = {
      css: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    };
    blob = new Blob('entity-1', 0, mockElement, 5000);
  });

  test('constructor sets properties', () => {
    expect(blob.id).toBe('entity-1');
    expect(blob.time).toBe(0);
    expect(blob.element).toBe(mockElement);
    expect(blob.duration).toBe(5000);
    expect(blob.timer).toBeDefined();
  });

  test('constructor uses default duration 5000', () => {
    const b = new Blob('x', 0, mockElement);
    expect(b.duration).toBe(5000);
  });

  test('setClickable() sets pointer-events to auto', () => {
    blob.setClickable();
    expect(mockElement.css).toHaveBeenCalledWith('pointer-events', 'auto');
  });

  test('isOver() returns false before duration', () => {
    expect(blob.isOver(100)).toBe(false);
  });

  test('isOver() returns true after duration', () => {
    expect(blob.isOver(6001)).toBe(true);
  });

  test('reset() updates timer start time', () => {
    blob.reset(1000);
    expect(blob.timer.time).toBe(1000);
  });

  test('destroy() calls element.remove() via jQuery wrapper', () => {
    blob.destroy();
    // destroy() calls $(this.element).remove()
    // The jQuery mock returns mockEl from $(), so mockEl.remove is called
    expect($._mockEl.remove).toHaveBeenCalled();
  });
});
