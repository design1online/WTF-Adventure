/* eslint-disable no-unused-vars */
import $ from 'jquery';

/**
 * Returns true if the given number is an integer
 * @param {Number} n the number to check
 * @return {Boolean}
 */
export const isInt = n => n % 1 === 0;
/**
 * CSS transition end event names for cross-browser compatibility
 * @type {String}
 */
export const TRANSITIONEND = 'transitionend webkitTransitionEnd oTransitionEnd';
/**
 * Returns true if the two rectangles do not overlap
 * @param {Object} rectOne the first rectangle with left, right, top, and bottom properties
 * @param {Object} rectTwo the second rectangle with left, right, top, and bottom properties
 * @return {Boolean}
 */
export const isIntersecting = (rectOne, rectTwo) => (
  rectTwo.left > rectOne.right
  || rectTwo.right < rectOne.left
  || rectTwo.top > rectOne.bottom
  || rectTwo.bottom < rectOne.top
);

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
/**
 * Cross-browser requestAnimationFrame implementation with setTimeout fallback
 * @type {Function}
 */
export const requestAnimFrame = (function requestAnmiF() {
  if (typeof window !== "undefined") {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (callback, element) {
          window.setTimeout(callback, 20);
        };
  }
}());
