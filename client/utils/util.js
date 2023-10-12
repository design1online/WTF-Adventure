/* eslint-disable no-unused-vars */
import $ from 'jquery';

export const isInt = n => n % 1 === 0;
export const TRANSITIONEND = 'transitionend webkitTransitionEnd oTransitionEnd';
export const isIntersecting = (rectOne, rectTwo) => (
  rectTwo.left > rectOne.right
  || rectTwo.right < rectOne.left
  || rectTwo.top > rectOne.bottom
  || rectTwo.bottom < rectOne.top
);

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
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
