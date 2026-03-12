import _ from 'underscore';

/**
 * Very useful file used for queuing various objects,
 * most notably used in the info controller to queue
 * objects to delete
 * @class
 */
export default class Queue {
  /**
   * Default constructor
   */
  constructor() {


    /**
     * The internal array holding queued objects
     * @type {Array}
     */
    this.queue = [];
  }

  /**
   * Clears all items from the queue
   */
  reset() {
    this.queue = [];
  }

  /**
   * Adds an object to the end of the queue
   * @param {Object} object the object to enqueue
   */
  add(object) {
    this.queue.push(object);
  }

  /**
   * Returns the current queue array
   * @return {Array}
   */
  getQueue() {
    return this.queue;
  }

  /**
   * Iterates over every item in the queue and invokes the given callback
   * @param {Function} callback the function to call for each queued object
   */
  forEachQueue(callback) {
    _.each(this.queue, (object) => {
      callback(object);
    });
  }
}
