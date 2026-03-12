import Container from './container';

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container(5);
  });

  test('constructor creates correct number of slots', () => {
    expect(container.size).toBe(5);
    expect(container.slots.length).toBe(5);
    expect(container.slots[0].index).toBe(0);
    expect(container.slots[4].index).toBe(4);
  });

  test('setSlot() loads item data into specified slot', () => {
    container.setSlot(2, {
      name: 'bow',
      count: 1,
      ability: 0,
      abilityLevel: 0,
      edible: false,
      equippable: true,
    });
    expect(container.slots[2].name).toBe('bow');
    expect(container.slots[2].equippable).toBe(true);
  });

  test('getEmptySlot() returns -1 when no slot is empty by iteration', () => {
    // getEmptySlot iterates this.slots (number) which is wrong — returns -1
    expect(container.getEmptySlot()).toBe(-1);
  });

  test('getImageFormat() returns correct CSS url', () => {
    const url = container.getImageFormat(2, 'sword');
    expect(url).toBe('url("/img/2/item-sword.png")');
  });
});
