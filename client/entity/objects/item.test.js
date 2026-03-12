import Item from './item';
import Entity from '../entity';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Item', () => {
  let item;

  beforeEach(() => {
    item = new Item(100, 'sword', 'Iron Sword', 1, 0, 0);
  });

  test('extends Entity', () => {
    expect(item).toBeInstanceOf(Entity);
  });

  test('constructor sets properties', () => {
    expect(item.count).toBe(1);
    expect(item.dropped).toBe(false);
    expect(item.stackable).toBe(false);
    expect(item.type).toBe('item');
    expect(item.shadow).toBe(true);
  });

  test('hasShadow() returns true', () => {
    expect(item.hasShadow()).toBe(true);
  });

  test('idle() calls setAnimation with idle/150', () => {
    const spy = jest.spyOn(item, 'setAnimation');
    item.idle();
    expect(spy).toHaveBeenCalledWith('idle', 150);
  });
});
