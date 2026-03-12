import { Modules } from './modules';

describe('Modules', () => {
  test('Orientation constants are defined', () => {
    expect(Modules.Orientation.Up).toBe(0);
    expect(Modules.Orientation.Down).toBe(1);
    expect(Modules.Orientation.Left).toBe(2);
    expect(Modules.Orientation.Right).toBe(3);
  });

  describe('Orientation.toString()', () => {
    it('returns "up" for 0', () => expect(Modules.Orientation.toString(0)).toBe('up'));
    it('returns "down" for 1', () => expect(Modules.Orientation.toString(1)).toBe('down'));
    it('returns "left" for 2', () => expect(Modules.Orientation.toString(2)).toBe('left'));
    it('returns "right" for 3', () => expect(Modules.Orientation.toString(3)).toBe('right'));
    it('returns null for unknown', () => expect(Modules.Orientation.toString(99)).toBeNull());
  });

  test('Types constants are defined', () => {
    expect(Modules.Types.Player).toBe(0);
  });

  test('InputType constants are defined', () => {
    expect(Modules.InputType.Key).toBe(0);
    expect(Modules.InputType.LeftClick).toBe(1);
  });

  test('Actions constants are defined', () => {
    expect(Modules.Actions.Idle).toBe(0);
    expect(Modules.Actions.Attack).toBe(1);
    expect(Modules.Actions.Walk).toBe(2);
  });

  test('Hits constants are defined', () => {
    expect(Modules.Hits.Damage).toBe(0);
    expect(Modules.Hits.Poison).toBe(1);
    expect(Modules.Hits.Heal).toBe(2);
    expect(Modules.Hits.Mana).toBe(3);
    expect(Modules.Hits.Experience).toBe(4);
    expect(Modules.Hits.LevelUp).toBe(5);
    expect(Modules.Hits.Critical).toBe(6);
    expect(Modules.Hits.Stun).toBe(7);
    expect(Modules.Hits.Explosive).toBe(8);
  });

  test('Equipment constants are defined', () => {
    expect(Modules.Equipment.Armour).toBe(0);
    expect(Modules.Equipment.Weapon).toBe(1);
    expect(Modules.Equipment.Pendant).toBe(2);
    expect(Modules.Equipment.Ring).toBe(3);
    expect(Modules.Equipment.Boots).toBe(4);
  });

  test('Hovering constants are defined', () => {
    expect(Modules.Hovering.Colliding).toBe(0);
    expect(Modules.Hovering.Mob).toBe(1);
    expect(Modules.Hovering.Player).toBe(2);
    expect(Modules.Hovering.Item).toBe(3);
    expect(Modules.Hovering.NPC).toBe(4);
    expect(Modules.Hovering.Chest).toBe(5);
  });

  test('Keys constants are defined', () => {
    expect(Modules.Keys.Enter).toBe(13);
    expect(Modules.Keys.Esc).toBe(27);
    expect(Modules.Keys.W).toBe(87);
  });

  test('AudioTypes constants are defined', () => {
    expect(Modules.AudioTypes.Music).toBe(0);
    expect(Modules.AudioTypes.SFX).toBe(1);
  });

  test('DamageColours are defined', () => {
    expect(Modules.DamageColours.received).toBeDefined();
    expect(Modules.DamageColours.inflicted).toBeDefined();
    expect(Modules.DamageColours.healed).toBeDefined();
    expect(Modules.DamageColours.mana).toBeDefined();
    expect(Modules.DamageColours.health).toBeDefined();
    expect(Modules.DamageColours.exp).toBeDefined();
    expect(Modules.DamageColours.poison).toBeDefined();
  });

  test('Pointers constants are defined', () => {
    expect(Modules.Pointers.Entity).toBe(0);
    expect(Modules.Pointers.Position).toBe(1);
    expect(Modules.Pointers.Relative).toBe(2);
  });
});
