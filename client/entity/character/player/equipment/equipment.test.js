import Equipment from './equipment';

describe('Equipment', () => {
  let equip;

  beforeEach(() => {
    equip = new Equipment('sword', 1, 'slash', 3);
  });

  test('constructor sets all properties', () => {
    expect(equip.name).toBe('sword');
    expect(equip.count).toBe(1);
    expect(equip.ability).toBe('slash');
    expect(equip.abilityLevel).toBe(3);
  });

  test('exists() returns true for valid name', () => {
    expect(equip.exists()).toBe(true);
  });

  test('exists() returns false for null name', () => {
    equip.name = null;
    expect(equip.exists()).toBe(false);
  });

  test('exists() returns false for "null" string', () => {
    equip.name = 'null';
    expect(equip.exists()).toBe(false);
  });

  test('getName() returns name', () => {
    expect(equip.getName()).toBe('sword');
  });

  test('getCount() returns count', () => {
    expect(equip.getCount()).toBe(1);
  });

  test('getAbility() returns ability', () => {
    expect(equip.getAbility()).toBe('slash');
  });

  test('getAbilityLevel() returns abilityLevel', () => {
    expect(equip.getAbilityLevel()).toBe(3);
  });

  test('update() updates all fields', () => {
    equip.update('axe', 5, 'chop', 2);
    expect(equip.name).toBe('axe');
    expect(equip.count).toBe(5);
    expect(equip.ability).toBe('chop');
    expect(equip.abilityLevel).toBe(2);
  });
});
