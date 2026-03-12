import Messages from './messages';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('./packets', () => ({
  __esModule: true,
  default: {
    Handshake: 0,
    Intro: 1,
    Welcome: 2,
    Spawn: 3,
    List: 4,
    Who: 5,
    Equipment: 6,
    Ready: 7,
    Sync: 8,
    Movement: 9,
    Teleport: 10,
    Request: 11,
    Despawn: 12,
    Target: 13,
    Combat: 14,
    Animation: 15,
    Projectile: 16,
    Population: 17,
    Points: 18,
    Network: 19,
    Chat: 20,
    Command: 21,
    Inventory: 22,
    Bank: 23,
    Ability: 24,
    Quest: 25,
    Notification: 26,
    Blink: 27,
    Heal: 28,
    Experience: 29,
    Death: 30,
    Audio: 31,
    NPC: 32,
    Respawn: 33,
    Trade: 34,
    Enchant: 35,
    Guild: 36,
    Pointer: 37,
    PVP: 38,
    Click: 39,
    Warp: 40,
    Shop: 41,
  },
}));

const makeClient = () => ({
  toggleLogin: jest.fn(),
  sendError: jest.fn(),
  game: { handleDisconnection: jest.fn() },
});

describe('Messages', () => {
  let client;

  beforeEach(() => {
    client = makeClient();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('stores the client reference', () => {
      const messages = new Messages(client);
      expect(messages.client).toBe(client);
    });

    it('populates the messages array with handler functions', () => {
      const messages = new Messages(client);
      expect(typeof messages.messages[0]).toBe('function'); // Handshake
      expect(typeof messages.messages[2]).toBe('function'); // Welcome
    });
  });

  describe('handleData()', () => {
    it('dispatches to the correct message handler', () => {
      const messages = new Messages(client);
      const cb = jest.fn();
      messages.onHandshake(cb);
      // packet 0 = Handshake, data item will be shift()ed
      messages.handleData([0, 'token123']);
      expect(cb).toHaveBeenCalledWith('token123');
    });

    it('does nothing for unknown packet types', () => {
      const messages = new Messages(client);
      expect(() => messages.handleData([999])).not.toThrow();
    });
  });

  describe('handleBulkData()', () => {
    it('calls handleData for each message in the array', () => {
      const messages = new Messages(client);
      const spy = jest.spyOn(messages, 'handleData');
      messages.handleBulkData([[0, 'a'], [0, 'b']]);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleUTF8()', () => {
    it('calls toggleLogin(false) for every message', () => {
      const messages = new Messages(client);
      messages.handleUTF8('full');
      expect(client.toggleLogin).toHaveBeenCalledWith(false);
    });

    it('sends the correct error for "full"', () => {
      const messages = new Messages(client);
      messages.handleUTF8('full');
      expect(client.sendError).toHaveBeenCalledWith(
        null,
        'The servers are currently full!',
      );
    });

    it('sends an unknown-error message for unrecognised strings', () => {
      const messages = new Messages(client);
      messages.handleUTF8('somethingweird');
      expect(client.sendError).toHaveBeenCalledWith(
        null,
        expect.stringContaining('somethingweird'),
      );
    });

    it('handles the "malform" case by calling handleDisconnection', () => {
      const messages = new Messages(client);
      messages.handleUTF8('malform');
      expect(client.game.handleDisconnection).toHaveBeenCalledWith(true);
    });
  });

  describe('callback registration and dispatch', () => {
    it('onWelcome / receiveWelcome fires with player data', () => {
      const messages = new Messages(client);
      const cb = jest.fn();
      messages.onWelcome(cb);
      messages.receiveWelcome([{ id: 1, username: 'hero' }]);
      expect(cb).toHaveBeenCalledWith({ id: 1, username: 'hero' });
    });

    it('onChat / receiveChat fires with chat info', () => {
      const messages = new Messages(client);
      const cb = jest.fn();
      messages.onChat(cb);
      messages.receiveChat([{ text: 'hello' }]);
      expect(cb).toHaveBeenCalledWith({ text: 'hello' });
    });

    it('does not throw when callback is not registered', () => {
      const messages = new Messages(client);
      expect(() => messages.receiveWelcome([{ id: 1 }])).not.toThrow();
    });
  });
});
