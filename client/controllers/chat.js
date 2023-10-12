import $ from 'jquery';
import Module from '../utils/modules';
import Packets from '../network/packets';

/**
 * Manages the game's chat log window and chat history
 * @class
 */
export default class Chat {
  /**
   * Default constructor
   * @param {Game} game instance of the game class
   */
  constructor(game) {
    /**
     * Instance of the game object
     * @type {Game}
     */
    this.game = game;

    /**
     * Jquery reference to the chat container
     * @type {DOMElement}
     */
    this.chat = $('#chat');

    /**
     * Jquery reference to the chat logs container
     * @type {DOMElement}
     */
    this.log = $('#chatLog');

    /**
     * Jquery reference to the chat input element
     * @type {DOMElement}
     */
    this.input = $('#hud-chat-input');

    /**
     * Jquery reference to the chat button
     * @type {DOMElement}
     */
    this.button = $('#hud-chat');

    /**
     * The visibility of the chat containers
     * @type {Boolean}
     */
    this.visible = false;

    /**
     * The duration before the chat message starts to fade out
     * @type {Number}
     */
    this.fadingDuration = 5000;

    /**
     * A reference to the timeout for the chat message
     * @type {Object}
     */
    this.fadingTimeout = null;

    /**
     * On click handler for the chat button, toggles the visibility
     * @type {Function}
     */
    this.button.click(() => {
      this.button.blur();

      if (this.input.is(':visible')) {
        this.hideInput();
      } else {
        this.toggle();
      }
    });
  }

  /**
  * Add a chat message
  * @param {String} label info in front of the message
  * @param {String} text the message text
  * @param {String} labelColor the color of the label
  * @param {String} textColor the color of the message text
  * @return null
  */
  add(label, text, labelColor, textColor) {
    const styleLabel = labelColor || 'white';
    const styleText = textColor || 'white';

    const element = $(
      `<p>
        <span style="color:${styleLabel}">${label}:</span>
        <span style="color:${styleText}"> ${text}</span>
      </p>`,
    );

    this.showChat();

    if (!this.isActive()) {
      this.hideInput();
    }

    this.hideChat();

    this.log.append(element);
    this.log.scrollTop(99999);
  }

  /**
  * Respond to key enter key presses for chat messages
  * @param {Number} keyCode the code for the key that was pressed
  * @return null
  */
  key(keyCode) {
    switch (keyCode) {
      case Module.Keys.Enter:
        if (this.input.val() === '') {
          this.toggle();
        } else {
          this.send();
        }

        break;
      default:
        break;
    }
  }

  /**
  * Send chat messages to the server via sockets
  * @return null
  */
  send() {
    this.game.socket.send(Packets.Chat, [this.input.val()]);
    this.toggle();
  }

  /**
  * Toggle if they chat UI is visible or not
  * @return null
  */
  toggle() {
    this.clean();

    if (this.visible && !this.isActive()) this.showInput();
    else if (this.visible) {
      this.hideInput();
      this.hideChat();
    } else {
      this.showChat();
      this.showInput();
    }
  }

  /**
  * Show the chat messages box
  * @return null
  */
  showChat() {
    this.chat.fadeIn('fast');

    this.visible = true;
  }

  /**
  * Show the input box for entering chat messages into
  * @return null
  */
  showInput() {
    this.button.addClass('active');

    this.input.fadeIn('fast');
    this.input.val('');
    this.input.focus();

    this.clean();
  }

  /**
  * Hides the input box for entering chat messages into
  * @return null
  */
  hideChat() {
    if (this.fadingTimeout) {
      clearTimeout(this.fadingTimeout);
      this.fadingTimeout = null;
    }

    this.fadingTimeout = setTimeout(() => {
      if (!this.isActive()) {
        this.chat.fadeOut('slow');

        this.visible = false;
      }
    }, this.fadingDuration);
  }

  /**
  * Hide the chat input boxes
  * @return null
  */
  hideInput() {
    this.button.removeClass('active');

    this.input.val('');
    this.input.fadeOut('fast');
    this.input.blur();

    this.hideChat();
  }

  /**
  * Reset the fade timeout
  * @return null
  */
  clean() {
    clearTimeout(this.fadingTimeout);
    this.fadingTimeout = null;
  }

  /**
  * Returns true if the input box has focus and is currently active
  * or being typed into
  * @return {Boolean}
  */
  isActive() {
    return this.input.is(':focus');
  }
}
