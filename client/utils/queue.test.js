import Queue from './queue';

describe('Queue', () => {
  let queue;

  beforeEach(() => {
    queue = new Queue();
  });

  test('constructor initializes empty queue', () => {
    expect(queue.queue).toEqual([]);
  });

  test('add() enqueues objects', () => {
    queue.add('a');
    queue.add('b');
    expect(queue.queue).toEqual(['a', 'b']);
  });

  test('getQueue() returns the queue array', () => {
    queue.add(42);
    expect(queue.getQueue()).toEqual([42]);
  });

  test('reset() clears the queue', () => {
    queue.add('x');
    queue.reset();
    expect(queue.queue).toEqual([]);
  });

  test('forEachQueue() iterates over all items', () => {
    queue.add(1);
    queue.add(2);
    queue.add(3);
    const seen = [];
    queue.forEachQueue(item => seen.push(item));
    expect(seen).toEqual([1, 2, 3]);
  });
});
