import io from 'socket.io-client';
import log from '../lib/log';
import Messages from './messages';

/**
 * Connect to the server via websockets
 * @class
 */
export default class Socket {
  /**
   * Default constructor
   * @param {Game} instance of the game
   */
  constructor(game) {
    log.debug('Socket - constructor()', game);

    /**
    * Instance of the game
    * @type {Game}
    */
    this.game = game;

    /**
    * Pulls out the client configuration from the Game instance
    * @type {Object}
    */
    this.config = this.game.client.config;

    /**
    * IO websocket connection
    * @type {Object}
    */
    this.connection = null;

    /**
    * Whether or not this websocket is listening
    * @type {Boolean}
    */
    this.listening = false;

    /**
    * Whether or not this websocket has disconnected
    * @type {Boolean}
    */
    this.disconnected = false;

    /**
    * Array of messages sent from the nodeJS server to the client side game
    * @type {Messages[]}
    */
    this.messages = new Messages(this.game.client);
  }

  /**
   * Loads the connection, attempts to create the websocket
   */
  connect() {
    const protocol = this.config.ssl ? 'wss' : 'ws';
    const url = `${protocol}://${this.config.ip}:${this.config.port}`;

    log.debug('Socket - connect()', url);

    this.connection = null;

    this.connection = io(url, {
      forceNew: true,
      reconnection: false,
      upgrade: false,
      transports: ['websocket'],
    });

    // listens for server side errors
    this.connection.on('error', (error) => {
      log.debug('Socket - connect() - error', error);
    });

    // listens for websocket connection errors (ie db errors, server down, timeouts)
    this.connection.on('connect_error', (error) => {
      log.debug('Socket - connect() - server connection error', this.config.ip);
      log.error(error);

      this.listening = false;

      this.game.client.toggleLogin(false);
      this.game.client.sendError(null, 'Could not connect to the game server.');
    });

    // listens for socket connection attempts
    this.connection.on('connect', () => {
      log.debug('Socket - connect() - connecting to server', this.config.ip);
      this.listening = true;

      this.game.client.updateLoader('Preparing handshake...');
      this.connection.emit('client', {
        gVer: this.config.version,
        cType: 'HTML5',
      });
    });

    // listens for server side messages
    this.connection.on('message', (message) => {
      log.debug('Socket - connect() - message', message);
      this.receive(message);
    });

    // listens for a disconnect
    this.connection.on('disconnect', () => {
      log.debug('Socket - connect() - disconnecting');
      this.game.handleDisconnection();
    });
  }

  /**
   * Gets a message from the server
   * @param {Messages} message a single message object
   */
  receive(message) {
    log.debug('Socket - receive()', message);

    if (!this.listening) {
      return;
    }

    if (message.startsWith('[')) {
      const data = JSON.parse(message);

      if (data.length > 1) {
        this.messages.handleBulkData(data);
      } else {
        this.messages.handleData(JSON.parse(message).shift());
      }
    } else {
      this.messages.handleUTF8(message);
    }
  }

  /**
   * Sends a data packet from the client side to the server side
   * @param  {Packets} packet type of data to send to the server
   * @param  {Object} data    object which will be stringified as JSON before
   * it is sent to the server
   */
  send(packet, data) {
    log.debug('Socket - send()', packet, data);

    const json = JSON.stringify([packet, data]);

    if (this.connection && this.connection.connected) {
      this.connection.send(json);
    }
  }
}
