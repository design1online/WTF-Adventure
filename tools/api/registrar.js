import redis from 'redis';

class Registrar {
  constructor() {
    this.client = redis.createClient('127.0.0.1', 6379, {
      socket_nodelay: true,
    });

    this.readyCallback();
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
}

function load() {
  const registrar = new Registrar();
  registrar.onReady(() => {});
}

export default Registrar;

load();
