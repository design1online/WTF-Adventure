import Pendant from './pendant';
import Equipment from './equipment';

describe('Pendant', () => {
  test('extends Equipment', () => {
    const pendant = new Pendant('goldrune', 1, 'mana', 1);
    expect(pendant).toBeInstanceOf(Equipment);
  });

  test('has Equipment methods', () => {
    const pendant = new Pendant('silvernecklace', 1, null, 0);
    expect(pendant.getName()).toBe('silvernecklace');
    expect(pendant.exists()).toBe(true);
  });
});
