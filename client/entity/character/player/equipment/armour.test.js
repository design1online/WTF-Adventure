import Armour from './armour';
import Equipment from './equipment';

describe('Armour', () => {
  let armour;

  beforeEach(() => {
    armour = new Armour('platemail', 1, 'block', 2);
  });

  test('extends Equipment', () => {
    expect(armour).toBeInstanceOf(Equipment);
  });

  test('constructor sets defence to -1 and name to clotharmor', () => {
    expect(armour.defence).toBe(-1);
    expect(armour.name).toBe('clotharmor');
  });

  test('setDefence() sets the defence value', () => {
    armour.setDefence(50);
    expect(armour.defence).toBe(50);
  });

  test('getDefence() returns the defence value', () => {
    armour.setDefence(30);
    expect(armour.getDefence()).toBe(30);
  });

  test('has Equipment methods', () => {
    expect(typeof armour.exists).toBe('function');
    expect(typeof armour.update).toBe('function');
  });
});
