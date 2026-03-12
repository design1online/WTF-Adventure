import Socket from './socket';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
    connected: true,
  })),
}));

jest.mock('./messages', () => {
  return jest.fn().mockImplementation(() => ({
    handleData: jest.fn(),
    handleBulkData: jest.fn(),
    handleUTF8: jest.fn(),
  }));
});

const makeGame = () => ({
  client: {
    config: {
      ssl: false,
      ip: '127.0.0.1',
      port: 8080,
      version: '1.0.0',
    },
    toggleLogin: jest.fn(),
    sendError: jest.fn(),
    updateLoader: jest.fn(),
  },
  handleDisconnection: jest.fn(),
});

describe('Socket', () => {
  let game;

  beforeEach(() => {
    game = makeGame();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('initializes with default values', () => {
      const socket = new Socket(game);
      expect(socket.game).toBe(game);
      expect(socket.config).toBe(game.client.config);
      expect(socket.connection).toBeNull();
      expect(socket.listening).toBe(false);
      expect(socket.disconnected).toBe(false);
      expect(socket.messages).toBeDefined();
    });
  });

  describe('connect()', () => {
    it('creates a socket.io connection with ws protocol when ssl is false', () => {
      const io = require('socket.io-client').default;
      const socket = new Socket(game);
      socket.connect();
      expect(io).toHaveBeenCalledWith(
        'ws://127.0.0.1:8080',
        expect.objectContaining({ forceNew: true, transports: ['websocket'] }),
      );
    });

    it('creates a socket.io connection with wss protocol when ssl is true', () => {
      const io = require('socket.io-client').default;
      game.client.config.ssl = true;
      const socket = new Socket(game);
      socket.connect();
      expect(io).toHaveBeenCalledWith(
        'wss://127.0.0.1:8080',
        expect.any(Object),
      );
    });

    it('registers event listeners on the connection', () => {
      const socket = new Socket(game);
      socket.connect();
      const { on } = socket.connection;
      expect(on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(on).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('receive()', () => {
    it('does nothing when not listening', () => {
      const socket = new Socket(game);
      socket.listening = false;
      socket.receive('[1,2,3]');
      expect(socket.messages.handleData).not.toHaveBeenCalled();
    });

    it('calls handleBulkData for arrays with multiple items', () => {
      const socket = new Socket(game);
      socket.listening = true;
      socket.receive('[[1,2],[3,4]]');
      expect(socket.messages.handleBulkData).toHaveBeenCalled();
    });

    it('calls handleData for arrays with a single item', () => {
      const socket = new Socket(game);
      socket.listening = true;
      socket.receive('[[1,2]]');
      expect(socket.messages.handleData).toHaveBeenCalled();
    });

    it('calls handleUTF8 for non-array messages', () => {
      const socket = new Socket(game);
      socket.listening = true;
      socket.receive('full');
      expect(socket.messages.handleUTF8).toHaveBeenCalledWith('full');
    });
  });

  describe('send()', () => {
    it('sends serialized JSON over the connection when connected', () => {
      const socket = new Socket(game);
      socket.connect();
      socket.send(5, { foo: 'bar' });
      expect(socket.connection.send).toHaveBeenCalledWith(
        JSON.stringify([5, { foo: 'bar' }]),
      );
    });

    it('does not send when there is no connection', () => {
      const socket = new Socket(game);
      socket.connection = null;
      // should not throw
      expect(() => socket.send(5, {})).not.toThrow();
    });
  });
});
