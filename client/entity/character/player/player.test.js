import Player from './player';
import Character from '../character';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player();
  });

  test('extends Character', () => {
    expect(player).toBeInstanceOf(Character);
  });

  test('constructor sets default string properties', () => {
    expect(player.username).toBe('');
    expect(player.password).toBe('');
    expect(player.email).toBe('');
  });

  test('constructor sets numeric defaults', () => {
    expect(player.experience).toBe(-1);
    expect(player.level).toBe(-1);
    expect(player.hitPoints).toBe(-1);
    expect(player.maxHitPoints).toBe(-1);
    expect(player.mana).toBe(-1);
    expect(player.maxMana).toBe(-1);
  });

  test('constructor sets boolean defaults', () => {
    expect(player.wanted).toBe(false);
    expect(player.pvpKills).toBe(-1);
    expect(player.pvpDeaths).toBe(-1);
  });

  test('constructor sets equipment instances', () => {
    expect(player.armour).toBeDefined();
    expect(player.weapon).toBeDefined();
    expect(player.pendant).toBeDefined();
    expect(player.ring).toBeDefined();
    expect(player.boots).toBeDefined();
  });

  test('type is "player"', () => {
    expect(player.type).toBe('player');
  });

  test('username can be set directly', () => {
    player.username = 'hero';
    expect(player.username).toBe('hero');
  });

  test('password can be set directly', () => {
    player.password = 'secret';
    expect(player.password).toBe('secret');
  });

  test('email can be set directly', () => {
    player.email = 'test@example.com';
    expect(player.email).toBe('test@example.com');
  });

  test('armour is accessible after loadEquipment', () => {
    expect(player.armour).toBeDefined();
  });

  test('hasWeapon() returns weapon instance', () => {
    expect(player.hasWeapon()).toBeDefined();
  });

  test('hasKeyboardMovement() returns boolean', () => {
    expect(typeof player.hasKeyboardMovement()).toBe('boolean');
  });

  test('getSpriteName() returns a string', () => {
    expect(typeof player.getSpriteName()).toBe('string');
  });

  test('setName() updates the name', () => {
    player.setName('Archer');
    expect(player.name).toBe('Archer');
  });

  test('setMana() and setMaxMana()', () => {
    player.setMana(50);
    expect(player.mana).toBe(50);
    player.setMaxMana(100);
    expect(player.maxMana).toBe(100);
  });

  test('getX() and getY() return positions', () => {
    player.setGridPosition(5, 10);
    expect(player.getX()).toBeDefined();
    expect(player.getY()).toBeDefined();
  });
});
