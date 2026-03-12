import _ from 'underscore';

/**
 * Abstract base class representing a network socket server
 * @class
 */
export default class Socket {
  /**
   * Default constructor
   * @param {Number} port the port number to listen on
   */
  constructor(port) {
    /**
     * The port number this socket listens on
     * @type {Number}
     */
    this.port = port;
  }

  /**
   * Broadcasts a message to all connected clients
   * @throws {String} always throws indicating invalid initialization
   */
  broadcast() {
    throw 'Invalid initialization.';
  }

  /**
   * Iterates over all active connections and invokes the callback for each
   * @param {Function} callback the function to invoke for each connection
   */
  forEachConnection(callback) {
    _.each(this._connections, callback);
  }

  /**
   * Adds a connection to the active connections map
   * @param {Object} connection the connection to add
   */
  addConnection(connection) {
    this._connections[connection.id] = connection;
  }

  /**
   * Removes a connection from the active connections map by id
   * @param {String} id the identifier of the connection to remove
   */
  removeConnection(id) {
    delete this._connections[id];
  }

  /**
   * Returns a connection by its identifier
   * @param {String} id the identifier of the connection to retrieve
   * @return {Object}
   */
  getConnection(id) {
    return this._connections[id];
  }

  /**
   * Registers a callback invoked when a new connection is established
   * @param {Function} callback the function to call on connect
   */
  onConnect(callback) {
    /**
     * Callback invoked when a new connection is established
     * @type {Function}
     */
    this.connectionCallback = callback;
  }

  /**
   * Registers a callback invoked when a socket error occurs
   * @param {Function} callback the function to call on error
   */
  onError(callback) {
    /**
     * Callback invoked when a socket error occurs
     * @type {Function}
     */
    this.errorCallback = callback;
  }

  /**
   * Registers a callback invoked when the connection type is determined
   * @param {Function} callback the function to call with the connection type
   */
  onConnectionType(callback) {
    /**
     * Callback invoked when the connection type is determined
     * @type {Function}
     */
    this.connectionTypeCallback = callback;
  }
}
