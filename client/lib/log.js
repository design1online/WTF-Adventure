'use client';

import $ from 'jquery';

/* global window, document, printStackTrace */
/* eslint-disable */
class Logger {

  /**
   * Default constructor
   * @param {String|null} level debug|info|error
   */
  constructor(level) {
    this.level = level;
    this.window = typeof window !== "undefined" ? $(window) : null;
    
    if (this.window) {
      this.level = this.window.debugLevel || level;
    }

    this.classMap = {};

    if (["debug", "info", "prod"].includes(this.level)) {
      console.info(`%cWTF`, `font-size: 200px;`);
    }
  }

  /**
   * Generate a random color within the acceptable 256 color range
   * @return {String} hexcode with a # prepended on it
   */
  randomColor() {
    let color = (Math.floor(Math.random() * 16777215)).toString(16);
    return `#${this.padEnd(color, 6, '0')}`;
  }

  /**
   * Pads the end of a string with the value if the String.prototype doesn't exist
   * This is particularly for CircleCI which keeps failing :( and always uses the
   * proptotype if it exists
   * @param  {String} str          a string (will be cast to be sure)
   * @param  {Number} targetLength how long the final string should be
   * @param  {String} val          what to pad the string with, defaults to space
   * @return {String}              returns the string at targetLength with val padded on the end
   */
  padEnd(str, targetLength, val = ' ') {
   str = String(str);
   targetLength = parseInt(targetLength, 10) || 0;

   if (str.length >= targetLength) {
     return str;
   }

   if (String.prototype.padEnd) {
     return str.padEnd(targetLength);
   }
   targetLength -= str.length;
   return str + val.repeat(targetLength);
 }

  /**
   * Figure out whether to return white or black text color for the
   * given background colorMatch
   * @param  {String} color the hexcode color without a # mark in front of it
   * @return {String} #000 for light colors and #fff for dark colors
   */
  lightOrDark(color) {

    let r;
    let g;
    let b;
    let hsp;
    let colorMatch;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If HEX --> store the red, green, blue values in separate variables
      colorMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
      [r, b, g] = colorMatch;
    } else {
      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +(`0x${color.slice(1).replace(
        color.length < 5 && /./g, '$&$&',
      )}`);

      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
      0.299 * (r * r)
    + 0.587 * (g * g)
    + 0.114 * (b * b),
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 150) {
      return '#000';
    }

    return '#fff';
  }

  /**
   * Given the name of the class this is for return
   * the previously associated color or associate a random
   * color to this class name
   * @param  {String} className the name of the class this log message is for
   * @return {{bgcolor:String, textcolor:String}} the background and text color for this
   *  class name
   */
  getColors(className) {
    let colors;
    const index = Object.keys(this.classMap).indexOf(className);
    const nextColorIndex = Object.keys(this.classMap).length;

    let colorList = [
      {
        textcolor: '#fff',
        bgcolor: '#1892ff' // blue
      },
      {
        textcolor: '#fff',
        bgcolor: '#000' // black
      },
      {
        textcolor: '#fff',
        bgcolor: '#ce2e83' // pink
      },
      {
        textcolor: '#000',
        bgcolor: '#3fec6b' // green
      },
      {
        textcolor: '#000',
        bgcolor: '#ff950d' // orange
      },
      {
        textcolor: '#fff',
        bgcolor: '#7a47ff' // purple
      },
      {
        textcolor: '#000',
        bgcolor: '#eed500' // yellow
      },
      {
        textcolor: '#fff',
        bgcolor: '#bd0e05' // red
      },
      {
        textcolor: '#fff',
        bgcolor: '#9c5f01' // brown
      },
      {
        textcolor: '#fff',
        bgcolor: '#6e7171' // gray
      },
      {
        textcolor: '#000',
        bgcolor: '#ffc391' // peach
      },
      {
        textcolor: '#000',
        bgcolor: '#ffb7be' // lavendar
      },
      {
        textcolor: '#000',
        bgcolor: '#96ef98' // mint
      },
      {
        textcolor: '#000',
        bgcolor: '#f0ef95' // cream
      },
      {
        textcolor: '#fff',
        bgcolor: '#025a8e' // dark blue
      },
      {
        textcolor: '#fff',
        bgcolor: '#630d3f' // plum
      },
      {
        textcolor: '#fff',
        bgcolor: '#9d3800' // pumpkin
      },
      {
        textcolor: '#fff',
        bgcolor: '#721c0d' // maroon
      },
      {
        textcolor: '#fff',
        bgcolor: '#3c4f05' // dark khaki
      }
    ];

    // grab the color at the classMap index
    if (index !== -1 && index < colorList.length) {
      colors = colorList[index];
    } else if (index !== -1 && index > colorList.length) {
      colors = colorList[nextColorIndex - index];
    } else if (index === -1 && nextColorIndex < colorList.length) {
      colors = colorList[nextColorIndex];
    } else {
      colors = colorList[0];
    }

    this.classMap[className] = colors.bgcolor;

    return colors;
  }

  /**
   * Helpter function format the console.log message
   * @param  {String} message the first variable passed to the console.log, generally a message
   *  formatted as `ClassName - propertyFunction() - optional additional message`
   * @param  {Object} rest an array of the rest of the variables passed to the console.log, typically class
   *  instances or variables in the file used for debugging
   */
  consoleLog(message, rest) {
    const [className, ...msg] = message.split('-').map(value => value.trim());
    const { bgcolor, textcolor } = this.getColors(className);

    if (rest.length) {
      console.info(`%c${className}`, `padding:5px;background-color:${bgcolor};color:${textcolor};font-weight:bold;`, '-', ...msg, rest); //eslint-disable-line
    } else {
      console.info(`%c${className}`, `padding:5px;background-color:${bgcolor};color:${textcolor};font-weight:bold;`, '-', ...msg); //eslint-disable-line
    }
  }

  /**
   * Put a information level message into the developer console, will only show up in debug or info level
   * @param  {String} message the first variable passed to the console.log, generally a message
   *  formatted as `ClassName - propertyFunction() - optional additional message`
   * @param  {Object} rest an array of the rest of the variables passed to the console.log, typically class
   *  instances or variables in the file used for debugging
   */
  info(message, ...rest) {
    if (this.level === 'debug' || this.level === 'info') {
      if (this.window.console) {
        this.consoleLog(message, rest);
      }
    }
  }

  /**
   * Put a debug level message into the developer console, will only show up in debug level
   * @param  {String} message the first variable passed to the console.log, generally a message
   *  formatted as `ClassName - propertyFunction() - optional additional message`
   * @param  {Object} rest an array of the rest of the variables passed to the console.log, typically class
   *  instances or variables in the file used for debugging
   */
  debug(message, ...rest) {
    if (this.level === 'debug') {
      this.consoleLog(message, rest);
    }
  }

  /**
   * Put an error level message into the developer console, will only show up if there is some level specified
   * @param  {String} message the first variable passed to the console.log, generally a message
   *  formatted as `ClassName - propertyFunction() - optional additional message`
   * @param  {Object} stacktrace the error stack trace
   * @param  {Object} rest an array of the rest of the variables passed to the console.log, typically class
   *  instances or variables in the file used for debugging
   */
  error(message, stacktrace, ...rest) {
    if (this.window.console && this.level) {
      console.error(message, rest); // eslint-disable-line
      if (stacktrace !== undefined && stacktrace === true) {
        const trace = printStackTrace();
        console.error(trace.join('\n\n')); //eslint-disable-line
        console.error('-----------------------------'); //eslint-disable-line
      }
    }
  }
}

export default new Logger('debug');
