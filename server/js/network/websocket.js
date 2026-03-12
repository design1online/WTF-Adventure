import serve from 'serve-static';
import http from 'http';
import StaticConnection from 'connect';
import { Server as SocketIO } from "socket.io";
import log from '../util/log.js';
import Socket from './socket.js';
import Utils from '../util/utils.js';

/**
 * Represents a single client connection over WebSocket
 * @class
 */
class Connection {
  /**
   * Default constructor
   * @param {String} id the unique identifier for this connection
   * @param {Object} socket the underlying socket.io socket
   * @param {Server} server the server instance that owns this connection
   */
  constructor(id, socket, server) {
    /**
     * The unique identifier for this connection
     * @type {String}
     */
    this.id = id;
    /**
     * The underlying socket.io socket
     * @type {Object}
     */
    this.socket = socket;
    /**
     * The server instance that owns this connection
     * @type {Server}
     */
    this._server = server; // eslint-disable-line

    this.socket.on('message', (message) => {
      if (this.listenCallback) {
        this.listenCallback(JSON.parse(message));
      }
    });

    this.socket.on('disconnect', () => {
      log.notice(`Closed socket: ${this.socket.conn.remoteAddress}`);

      if (this.closeCallback) {
        this.closeCallback();
      }

      delete this._server.removeConnection(this.id);
    });
  }

  /**
   * Registers a callback invoked when a message is received from the client
   * @param {Function} callback the function to call with the parsed message
   */
  listen(callback) {
    /**
     * Callback invoked when a message is received
     * @type {Function}
     */
    this.listenCallback = callback;
  }

  /**
   * Registers a callback invoked when this connection is closed
   * @param {Function} callback the function to call on close
   */
  onClose(callback) {
    /**
     * Callback invoked when the connection is closed
     * @type {Function}
     */
    this.closeCallback = callback;
  }

  /**
   * Serializes and sends a message to the client
   * @param {Object} message the message object to send
   */
  send(message) {
    this.sendUTF8(JSON.stringify(message));
  }

  /**
   * Sends raw UTF8 data directly over the socket
   * @param {String} data the raw data string to send
   */
  sendUTF8(data) {
    this.socket.send(data);
  }

  /**
   * Closes this connection with an optional reason
   * @param {String} reason the reason for closing the connection
   */
  close(reason) {
    if (reason) {
      log.notice(`[Connection] Closing - ${reason}`);
    }

    this.socket.conn.close();
  }
}

/**
 * WebSocket server that manages client connections using socket.io
 * @class
 */
class Server extends Socket {
  /**
   * Default constructor
   * @param {String} host the hostname or IP address to bind the server to
   * @param {Number} port the port number to listen on
   * @param {String} version the required client version string
   */
  constructor(host, port, version) {
    super(port);

    /**
     * The hostname or IP address the server is bound to
     * @type {String}
     */
    this.host = host;
    /**
     * The required client version string
     * @type {String}
     */
    this.version = version;
    /**
     * Map of active connections keyed by connection id
     * @type {Object}
     */
    this._connections = {};
    /**
     * Counter used to generate unique connection ids
     * @type {Number}
     */
    this._counter = 0;
    /**
     * Map of connected IP addresses to track connection counts
     * @type {Object}
     */
    this.ips = {};

    // Serve statically for faster development
    const connect = StaticConnection();

    connect.use(serve('client', {
      index: ['index.html'],
    }), null);

    /** @type {Object} */
    this.httpServer = http
      .createServer(connect)
      .listen(port, host, () => {
        log.notice(`Server is now listening on: ${port}`);
        if (this.webSocketReadyCallback) {
          this.webSocketReadyCallback();
        }
      });

    /** @type {Object} */
    this.io = new SocketIO(this.httpServer);
    this.io.on('connection', (socket) => {
      log.notice(`Received connection from: ${socket.conn.remoteAddress}`);

      const client = new Connection(this.createId(), socket, this);

      socket.on('client', (data) => {
        // check the client version of socket.io matches the server version
        if (data.gVer !== this.version) {
          client.sendUTF8('updated');
          log.notice(data.gVer);
          log.notice(this.version);
          client.close('Client version is out of sync with the server.');
        }

        if (this.connectionCallback) {
          this.connectionCallback(client);
        }

        this.addConnection(client);
      });

      socket.on('u_message', (message) => {
        // Used for unity messages as Socket.IO differs

        if (client.listenCallback) client.listenCallback(message);
      });
    });
  }

  /**
   * Generates a unique connection id using a random number and counter
   * @return {String}
   */
  createId() {
    this._counter += 1;
    return `1${Utils.random(99)}${this._counter}`;
  }

  /**
   * Broadcasts a message to all connected clients
   * @param {Object} message the message to broadcast
   */
  broadcast(message) {
    this.forEachConnection((connection) => {
      connection.send(message);
    });
  }

  /**
   * Registers a callback invoked when a new client connects
   * @param {Function} callback the function to call with the new connection
   */
  onConnect(callback) {
    /**
     * Callback invoked when a new client connects
     * @type {Function}
     */
    this.connectionCallback = callback;
  }

  /**
   * Registers a callback invoked when a status request is received
   * @param {Function} callback the function to call for status requests
   */
  onRequestStatus(callback) {
    /**
     * Callback invoked when a status request is received
     * @type {Function}
     */
    this.statusCallback = callback;
  }

  /**
   * Registers a callback invoked when the WebSocket server is ready
   * @param {Function} callback the function to call when the server is ready
   */
  onWebSocketReady(callback) {
    /**
     * Callback invoked when the WebSocket server is ready
     * @type {Function}
     */
    this.webSocketReadyCallback = callback;
  }
}

export default {
  Server,
  Connection,
};
