'use client'

import $ from 'jquery';

/**
 * Base class for profile dialog pages
 * @class
 */
export default class GamePage {
  /**
   * Default constructor
   * @param {String} element the CSS selector for the page body element
   */
  constructor(element) {
    /**
     * The page body element
     * @type {jQuery}
     */
    this.body = $(element);
    /**
     * Whether this page has been loaded with data
     * @type {Boolean}
     */
    this.loaded = false;
  }

  /**
   * Shows the page body with a slow fade-in
   */
  show() {
    this.body.fadeIn('slow');
  }

  /**
   * Hides the page body with a slow fade-out
   */
  hide() {
    this.body.fadeOut('slow');
  }

  /**
   * Returns whether the page body is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }

  /**
   * Loads the page content
   */
  loadPage() {
    // @TODO
    log.debug('Page - loadPage() - @TODO');
  }

  /**
   * Recalculates layout when the window is resized
   */
  resize() {
    // @TODO
    log.debug('Page - resize() - @TODO');
  }

  /**
   * Updates the page with the latest data
   */
  update() {
    // @TODO
    log.debug('Page - update() - @TODO');
  }

  /**
   * Returns a CSS url string for the item image at the given scale
   * @param {Number} scale the drawing scale factor
   * @param {String} name the item name used in the image filename
   * @return {String}
   */
  getImageFormat(scale, name) {
    if (!name || name === 'null') {
      return '';
    }

    return `url("/img/${scale}/item-${name}.png")`;
  }
}
