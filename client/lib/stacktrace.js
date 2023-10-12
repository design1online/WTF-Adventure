// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Øyvind Sean Kinsey http://kinsey.no/blog (2010)
//
// Information and discussions
// http://jspoker.pokersource.info/skin/test-printstacktrace.html
// http://eriwen.com/javascript/js-stack-trace/
// http://eriwen.com/javascript/stacktrace-update/
// http://pastie.org/253058
//
// guessFunctionNameFromLines comes from firebug
//
// Software License Agreement (BSD License)
//
// Copyright (c) 2007, Parakey Inc.
// All rights reserved.
//
// Redistribution and use of this software in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above
//   copyright notice, this list of conditions and the
//   following disclaimer.
//
// * Redistributions in binary form must reproduce the above
//   copyright notice, this list of conditions and the
//   following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// * Neither the name of Parakey Inc. nor the names of its
//   contributors may be used to endorse or promote products
//   derived from this software without specific prior
//   written permission of Parakey Inc.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
// OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
  const ex = options && options.e ? options.e : null;
  const guess = options ? !!options.guess : true;

  const p = new printStackTrace.implementation();
  const result = p.run(ex);
  return guess ? p.guessFunctions(result) : result;
}

printStackTrace.implementation = () => {};

printStackTrace.implementation.prototype = {
  run(ex) {
    // Use either the stored mode, or resolve it
    const mode = this._mode || this.mode();
    if (mode === 'other') {
      return this.other(arguments.callee);
    }
    ex = ex
      || (function () {
        try {
          const _err = __undef__ << 1;
        } catch (e) {
          return e;
        }
      }());
    return this[mode](ex);
  },

  /**
   * @return {String} mode of operation for the environment in question.
   */
  mode() {
    try {
      const _err = __undef__ << 1;
    } catch (e) {
      if (e.arguments) {
        return (this._mode = 'chrome');
      }
      if (typeof window !== "undefined" && window.opera && e.stacktrace) {
        return (this._mode = 'opera10');
      }
      if (e.stack) {
        return (this._mode = 'firefox');
      }
      if (typeof window !== "undefined" && window.opera && !('stacktrace' in e)) {
        // Opera 9-
        return (this._mode = 'opera');
      }
    }
    return (this._mode = 'other');
  },

  /**
   * Given a context, function name, and callback function, overwrite it so that it calls
   * printStackTrace() first with a callback and then runs the rest of the body.
   *
   * @param {Object} context of execution (e.g. window)
   * @param {String} functionName to instrument
   * @param {Function} function to call with a stack trace on invocation
   */
  instrumentFunction(context, functionName, callback) {
    if (typeof window !== "undefined") {
      context = context || window;
    }
    
    context[`_old${functionName}`] = context[functionName];
    context[functionName] = function () {
      callback.call(this, printStackTrace());
      return context[`_old${functionName}`].apply(this, arguments);
    };
    context[functionName]._instrumented = true;
  },

  /**
   * Given a context and function name of a function that has been
   * instrumented, revert the function to it's original (non-instrumented)
   * state.
   *
   * @param {Object} context of execution (e.g. window)
   * @param {String} functionName to de-instrument
   */
  deinstrumentFunction(context, functionName) {
    if (
      context[functionName].constructor === Function
      && context[functionName]._instrumented
      && context[`_old${functionName}`].constructor === Function
    ) {
      context[functionName] = context[`_old${functionName}`];
    }
  },

  /**
   * Given an Error object, return a formatted Array based on Chrome's stack string.
   *
   * @param e - Error object to inspect
   * @return Array<String> of function calls, files and line numbers
   */
  chrome(e) {
    return e.stack
      .replace(/^[^\n]*\n/, '')
      .replace(/^[^\n]*\n/, '')
      .replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      .split('\n');
  },

  /**
   * Given an Error object, return a formatted Array based on Firefox's stack string.
   *
   * @param e - Error object to inspect
   * @return Array<String> of function calls, files and line numbers
   */
  firefox(e) {
    return e.stack
      .replace(/^[^\n]*\n/, '')
      .replace(/(?:\n@:0)?\s+$/m, '')
      .replace(/^\(/gm, '{anonymous}(')
      .split('\n');
  },

  /**
   * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
   *
   * @param e - Error object to inspect
   * @return Array<String> of function calls, files and line numbers
   */
  opera10(e) {
    const stack = e.stacktrace;
    const lines = stack.split('\n');
    const ANON = '{anonymous}';
    const lineRE = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i;
    let i;
    let j;
    let len;

    for (i = 2, j = 0, len = lines.length; i < len - 2; i += 1) {
      if (lineRE.test(lines[i])) {
        const location = `${RegExp.$6}:${RegExp.$1}:${RegExp.$2}`;
        let fnName = RegExp.$3;
        fnName = fnName.replace(/<anonymous function\s?(\S+)?>/g, ANON);
        lines[j += 1] = `${fnName}@${location}`;
      }
    }

    lines.splice(j, lines.length - j);
    return lines;
  },

  // Opera 7.x-9.x only!
  opera(e) {
    const lines = e.message.split('\n');
    const ANON = '{anonymous}';
    const lineRE = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i;
    let i;
    let j;
    let len;

    for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
      // TODO: RegExp.exec() would probably be cleaner here
      if (lineRE.test(lines[i])) {
        lines[j += 1] = `${RegExp.$3
          ? `${RegExp.$3}()@${RegExp.$2}${RegExp.$1}`
          : `${ANON}()@${RegExp.$2}:${RegExp.$1}`
        } -- ${
          lines[i + 1].replace(/^\s+/, '')}`;
      }
    }

    lines.splice(j, lines.length - j);
    return lines;
  },

  // Safari, IE, and others
  other(curr) {
    const ANON = '{anonymous}';
    const fnRE = /function\s*([\w\-$]+)?\s*\(/i;
    const stack = [];
    let j = 0;
    let fn;
    let args;
    const maxStackSize = 10;
    while (curr && stack.length < maxStackSize) {
      fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
      args = Array.prototype.slice.call(curr.arguments);
      stack[j += 1] = `${fn}(${this.stringifyArguments(args)})`;
      curr = curr.caller;
    }
    return stack;
  },

  /**
   * Given arguments array as a String, subsituting type names for non-string types.
   *
   * @param {Arguments} object
   * @return {Array} of Strings with stringified arguments
   */
  stringifyArguments(args) {
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      if (arg === undefined) {
        args[i] = 'undefined';
      } else if (arg === null) {
        args[i] = 'null';
      } else if (arg.constructor) {
        if (arg.constructor === Array) {
          if (arg.length < 3) {
            args[i] = `[${this.stringifyArguments(arg)}]`;
          } else {
            args[i] = `[${
              this.stringifyArguments(Array.prototype.slice.call(arg, 0, 1))
            }...${
              this.stringifyArguments(Array.prototype.slice.call(arg, -1))
            }]`;
          }
        } else if (arg.constructor === Object) {
          args[i] = '#object';
        } else if (arg.constructor === Function) {
          args[i] = '#function';
        } else if (arg.constructor === String) {
          args[i] = `"${arg}"`;
        }
      }
    }
    return args.join(',');
  },

  sourceCache: {},

  /**
   * @return the text from a given URL.
   */
  ajax(url) {
    const req = this.createXMLHTTPObject();
    if (!req) {
      return;
    }
    req.open('GET', url, false);
    req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    req.send('');
    return req.responseText;
  },

  /**
   * Try XHR methods in order and store XHR factory.
   *
   * @return <Function> XHR function or equivalent
   */
  createXMLHTTPObject() {
    let xmlhttp;
    const XMLHttpFactories = [
      () => new XMLHttpRequest(),
      () => new ActiveXObject('Msxml2.XMLHTTP'),
      () => new ActiveXObject('Msxml3.XMLHTTP'),
      () => new ActiveXObject('Microsoft.XMLHTTP'),
    ];
    for (let i = 0; i < XMLHttpFactories.length; i += 1) {
      try {
        xmlhttp = XMLHttpFactories[i]();
        // Use memoization to cache the factory
        this.createXMLHTTPObject = XMLHttpFactories[i];
        return xmlhttp;
      } catch (e) {}
    }
  },

  /**
   * Given a URL, check if it is in the same domain (so we can get the source
   * via Ajax).
   *
   * @param url <String> source url
   * @return False if we need a cross-domain request
   */
  isSameDomain(url) {
    return url.indexOf(location.hostname) !== -1;
  },

  /**
   * Get source code from given URL if in the same domain.
   *
   * @param url <String> JS source URL
   * @return <String> Source code
   */
  getSource(url) {
    if (!(url in this.sourceCache)) {
      this.sourceCache[url] = this.ajax(url).split('\n');
    }
    return this.sourceCache[url];
  },

  guessFunctions(stack) {
    for (let i = 0; i < stack.length; ++i) {
      const reStack = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w[^-]]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
      const frame = stack[i];
      const m = reStack.exec(frame);
      if (m) {
        const file = m[1];
        const lineno = m[4]; // m[7] is character position in Chrome
        if (file && this.isSameDomain(file) && lineno) {
          const functionName = this.guessFunctionName(file, lineno);
          stack[i] = frame.replace('{anonymous}', functionName);
        }
      }
    }
    return stack;
  },

  guessFunctionName(url, lineNo) {
    try {
      return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
    } catch (e) {
      return (
        `getSource failed with url: ${url}, exception: ${e.toString()}`
      );
    }
  },

  guessFunctionNameFromLines(lineNo, source) {
    const reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
    const reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
    // Walk backwards from the first line in the function until we find the line which
    // matches the pattern above, which is the function definition
    let line = '';
    const maxLines = 10;

    for (let i = 0; i < maxLines; ++i) {
      line = source[lineNo - i] + line;
      if (line !== undefined) {
        let m = reGuessFunction.exec(line);
        if (m && m[1]) {
          return m[1];
        }
        m = reFunctionArgNames.exec(line);
        if (m && m[1]) {
          return m[1];
        }
      }
    }
    return '(?)';
  },
};
