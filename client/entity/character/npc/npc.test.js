import Npc from './npc';
import Character from '../character';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Npc', () => {
  let npc;

  beforeEach(() => {
    npc = new Npc(2, 'elder', 'Village Elder');
  });

  test('extends Character', () => {
    expect(npc).toBeInstanceOf(Character);
  });

  test('constructor sets type to "npc"', () => {
    expect(npc.type).toBe('npc');
  });

  test('constructor sets index to 0', () => {
    expect(npc.index).toBe(0);
  });

  test('talk() returns first message on first call', () => {
    const messages = ['Hello!', 'How are you?', 'Goodbye!'];
    expect(npc.talk(messages)).toBe('Hello!');
  });

  test('talk() cycles through messages', () => {
    const messages = ['msg1', 'msg2', 'msg3'];
    npc.talk(messages); // index becomes 1
    expect(npc.talk(messages)).toBe('msg2');
  });

  test('talk() resets when index exceeds message count', () => {
    const messages = ['only'];
    npc.index = 5; // exceeds count
    const msg = npc.talk(messages);
    // After reset: index=0, count=1: index(0) < count(1) → returns messages[0]
    expect(msg).toBe('only');
  });
});
