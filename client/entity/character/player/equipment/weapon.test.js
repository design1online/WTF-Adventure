import Weapon from './weapon';
import Equipment from './equipment';

describe('Weapon', () => {
  let weapon;

  beforeEach(() => {
    weapon = new Weapon('longsword', 1, 'slash', 3);
  });

  test('extends Equipment', () => {
    expect(weapon).toBeInstanceOf(Equipment);
  });

  test('constructor sets level, damage, ranged defaults', () => {
    expect(weapon.level).toBe(-1);
    expect(weapon.damage).toBe(-1);
    expect(weapon.ranged).toBe(false);
  });

  test('setDamage() sets damage', () => {
    weapon.setDamage(100);
    expect(weapon.damage).toBe(100);
  });

  test('getDamage() returns damage', () => {
    weapon.setDamage(75);
    expect(weapon.getDamage()).toBe(75);
  });

  test('setLevel() sets level', () => {
    weapon.setLevel(5);
    expect(weapon.level).toBe(5);
  });

  test('getLevel() returns level', () => {
    weapon.setLevel(3);
    expect(weapon.getLevel()).toBe(3);
  });

  test('has Equipment methods', () => {
    expect(typeof weapon.exists).toBe('function');
    expect(typeof weapon.update).toBe('function');
  });
});
