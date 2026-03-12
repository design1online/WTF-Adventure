import Boots from './boots';
import Equipment from './equipment';

describe('Boots', () => {
  test('extends Equipment', () => {
    const boots = new Boots('ironboots', 1, 'speed', 2);
    expect(boots).toBeInstanceOf(Equipment);
  });

  test('has Equipment methods', () => {
    const boots = new Boots('leatherboots', 1, null, 0);
    expect(boots.getName()).toBe('leatherboots');
    expect(boots.exists()).toBe(true);
  });
});
