import Ring from './ring';
import Equipment from './equipment';

describe('Ring', () => {
  test('extends Equipment', () => {
    const ring = new Ring('goldring', 1, 'power', 2);
    expect(ring).toBeInstanceOf(Equipment);
  });

  test('has Equipment methods', () => {
    const ring = new Ring('silverring', 1, null, 0);
    expect(ring.getName()).toBe('silverring');
    expect(ring.exists()).toBe(true);
  });
});
