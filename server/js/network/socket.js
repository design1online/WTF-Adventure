/**
 * Abstract Class for Socket
 */
import _ from 'underscore';

export default class Socket {
  constructor(port) {
    this.port = port;
  }

  broadcast() {
    throw 'Invalid initialization.';
  }

  forEachConnection(callback) {
    _.each(this._connections, callback);
  }

  addConnection(connection) {
    this._connections[connection.id] = connection;
  }

  removeConnection(id) {
    delete this._connections[id];
  }

  getConnection(id) {
    return this._connections[id];
  }

  onConnect(callback) {
    this.connectionCallback = callback;
  }

  onError(callback) {
    this.errorCallback = callback;
  }

  onConnectionType(callback) {
    this.connectionTypeCallback = callback;
  }
}
