import redis from 'redis';

/**
 * Manages a Redis client connection for server registration
 * @class
 */
class Registrar {
  /**
   * Default constructor - creates a Redis client and invokes the ready callback
   */
  constructor() {
    /**
     * The Redis client instance
     * @type {Object}
     */
    this.client = redis.createClient('127.0.0.1', 6379, {
      socket_nodelay: true,
    });

    this.readyCallback();
  }

  /**
   * Registers a callback invoked when the registrar is ready
   * @param {Function} callback the function to call when ready
   */
  onReady(callback) {
    /** @type {Function} */
    this.readyCallback = callback;
  }
}

/**
 * Creates a Registrar instance and sets a no-op ready callback
 */
function load() {
  const registrar = new Registrar();
  registrar.onReady(() => {});
}

export default Registrar;

load();
