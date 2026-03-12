import Chest from './chest';
import Entity from '../entity';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Chest', () => {
  let chest;

  beforeEach(() => {
    chest = new Chest(200, 'chest');
  });

  test('extends Entity', () => {
    expect(chest).toBeInstanceOf(Entity);
  });

  test('constructor sets type to "chest"', () => {
    expect(chest.type).toBe('chest');
  });

  test('idle() calls setAnimation with idle_down/150', () => {
    const spy = jest.spyOn(chest, 'setAnimation');
    chest.idle();
    expect(spy).toHaveBeenCalledWith('idle_down', 150);
  });

  test('stop() calls setAnimation with idle_down/150', () => {
    const spy = jest.spyOn(chest, 'setAnimation');
    chest.stop();
    expect(spy).toHaveBeenCalledWith('idle_down', 150);
  });
});
