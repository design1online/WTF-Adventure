import Slot from './slot';

describe('Slot', () => {
  let slot;

  beforeEach(() => {
    slot = new Slot(3);
  });

  test('constructor sets index and defaults', () => {
    expect(slot.index).toBe(3);
    expect(slot.name).toBeNull();
    expect(slot.count).toBe(-1);
    expect(slot.ability).toBe(-1);
    expect(slot.abilityLevel).toBe(-1);
    expect(slot.edible).toBe(false);
    expect(slot.equippable).toBe(false);
  });

  test('loadSlot() fills slot with item data', () => {
    slot.loadSlot('sword', 1, 2, 3, false, true);
    expect(slot.name).toBe('sword');
    expect(slot.count).toBe(1);
    expect(slot.ability).toBe(2);
    expect(slot.abilityLevel).toBe(3);
    expect(slot.edible).toBe(false);
    expect(slot.equippable).toBe(true);
  });

  test('empty() resets all slot properties', () => {
    slot.loadSlot('axe', 5, 1, 2, true, false);
    slot.empty();
    expect(slot.name).toBeNull();
    expect(slot.count).toBe(-1);
    expect(slot.ability).toBe(-1);
    expect(slot.abilityLevel).toBe(-1);
    expect(slot.edible).toBe(false);
    expect(slot.equippable).toBe(false);
  });

  test('isEmpty() returns true when empty', () => {
    expect(slot.isEmpty()).toBe(true);
  });

  test('isEmpty() returns false when name is set', () => {
    slot.loadSlot('potion', 2, 0, 0, true, false);
    expect(slot.isEmpty()).toBe(false);
  });

  test('setCount() updates count', () => {
    slot.setCount(10);
    expect(slot.count).toBe(10);
  });
});
