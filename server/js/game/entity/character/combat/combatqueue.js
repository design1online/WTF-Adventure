/**
 * A queue that holds pending hit actions for combat processing
 * @class
 */
export default class CombatQueue {
  /**
   * Default constructor
   */
  constructor() {
    /**
     * The list of pending hits to process
     * @type {Array}
     */
    this.hitQueue = [];
  }

  /**
   * Adds a hit to the queue
   * @param {Hit} hit the hit to add
   */
  add(hit) {
    this.hitQueue.push(hit);
  }

  /**
   * Returns whether there are pending hits in the queue
   * @return {Boolean}
   */
  hasQueue() {
    return this.hitQueue.length > 0;
  }

  /**
   * Clears all pending hits from the queue
   */
  clear() {
    this.hitQueue = [];
  }

  /**
   * Removes and returns the data for the next hit in the queue
   * @return {Object|null}
   */
  getHit() {
    if (this.hitQueue.length < 1) {
      return null;
    }

    const hit = this.hitQueue.shift();

    return hit.getData();
  }
}
