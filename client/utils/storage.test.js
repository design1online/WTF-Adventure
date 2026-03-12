import Storage from './storage';

// Mock the log module
jest.mock('../lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

function makeClient(version = '1.0.0') {
  return {
    config: { version },
  };
}

describe('Storage', () => {
  let storage;
  let client;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    client = makeClient('1.0.0');
  });

  test('constructor creates a Storage instance', () => {
    storage = new Storage(client);
    expect(storage).toBeDefined();
    expect(storage.data).toBeDefined();
  });

  test('loadStorage() creates fresh data when localStorage is empty', () => {
    storage = new Storage(client);
    expect(storage.data.new).toBe(true);
    expect(storage.data.welcome).toBe(true);
  });

  test('create() returns default data object', () => {
    storage = new Storage(client);
    const data = storage.create();
    expect(data.new).toBe(true);
    expect(data.clientVersion).toBe('1.0.0');
    expect(data.player.username).toBe('');
    expect(data.settings.music).toBe(100);
  });

  test('save() persists data to localStorage', () => {
    storage = new Storage(client);
    storage.data.player.username = 'testuser';
    storage.save();
    const raw = localStorage.getItem('data');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.player.username).toBe('testuser');
  });

  test('clear() removes data and resets to defaults', () => {
    storage = new Storage(client);
    storage.data.player.username = 'testuser';
    storage.save();
    storage.clear();
    expect(storage.data.player.username).toBe('');
  });

  test('toggleRemember() sets rememberMe and saves', () => {
    storage = new Storage(client);
    storage.toggleRemember(true);
    expect(storage.data.player.rememberMe).toBe(true);
    storage.toggleRemember(false);
    expect(storage.data.player.rememberMe).toBe(false);
  });

  test('setPlayer() updates a player field', () => {
    storage = new Storage(client);
    storage.setPlayer('username', 'hero');
    expect(storage.data.player.username).toBe('hero');
  });

  test('setPlayer() ignores unknown fields', () => {
    storage = new Storage(client);
    storage.setPlayer('nonexistent', 'value');
    expect(storage.data.player.nonexistent).toBeUndefined();
  });

  test('setSettings() updates a settings field', () => {
    storage = new Storage(client);
    storage.setSettings('music', 50);
    expect(storage.data.settings.music).toBe(50);
  });

  test('getPlayer() returns the player data object', () => {
    storage = new Storage(client);
    const player = storage.getPlayer();
    expect(player).toBeDefined();
    expect(player).toHaveProperty('username');
  });

  test('getSettings() returns the settings object', () => {
    storage = new Storage(client);
    const settings = storage.getSettings();
    expect(settings).toBeDefined();
    expect(settings).toHaveProperty('music');
  });

  test('loadStorage() resets data when client version changes', () => {
    storage = new Storage(client);
    storage.data.clientVersion = '0.0.1';
    storage.save();

    // New storage with same client version reads from localStorage
    // but version mismatch forces reset
    const storage2 = new Storage(makeClient('2.0.0'));
    expect(storage2.data.clientVersion).toBe('2.0.0');
  });
});
