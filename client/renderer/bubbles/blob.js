import $ from 'jquery';
import Timer from '../../utils/timer';

/**
 * A type of bubble
 * @class
 */
export default class Blob {
  constructor(id, time, element, duration) {
    this.id = id;
    this.time = time;
    this.element = element;
    this.duration = duration || 5000;
    this.timer = new Timer(this.time, this.duration);
  }

  setClickable() {
    this.element.css('pointer-events', 'auto');
  }

  isOver(time) {
    return this.timer.isOver(time);
  }

  reset(time) {
    this.timer.time = time;
  }

  destroy() {
    $(this.element).remove();
  }
}
