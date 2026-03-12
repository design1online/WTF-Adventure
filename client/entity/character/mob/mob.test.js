import Mob from './mob';
import Character from '../character';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Mob', () => {
  let mob;

  beforeEach(() => {
    mob = new Mob(1, 'goblin', 'Goblin King');
  });

  test('constructor sets type to "mob"', () => {
    expect(mob.type).toBe('mob');
  });

  test('constructor sets hitPoints to -1', () => {
    expect(mob.hitPoints).toBe(-1);
    expect(mob.maxHitPoints).toBe(-1);
  });

  test('constructor sets name to kind', () => {
    expect(mob.name).toBe('goblin');
  });

  test('extends Character', () => {
    expect(mob).toBeInstanceOf(Character);
  });

  test('setName() updates name', () => {
    mob.setName('Orc Warrior');
    expect(mob.name).toBe('Orc Warrior');
  });
});
