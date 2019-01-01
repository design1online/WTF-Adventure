/* global Packets, Modules, log */

define(["jquery"], function($) {
  return Class.extend({
    init(game) {
      var self = this;

      this.game = game;

      this.chat = $("#chat");
      this.log = $("#chatLog");
      this.input = $("#hud-chat-input");
      this.button = $("#hud-chat");

      this.visible = false;

      this.fadingDuration = 5000;
      this.fadingTimeout = null;

      this.button.click(function() {
        this.button.blur();

        if (this.input.is(":visible")) this.hideInput();
        else this.toggle();
      });
    },

    add(source, text, labelColor, textColor) {
      styleLabel = labelColor ? labelColor : "white";
      styleText = textColor ? textColor : "white";
      var self = this,
        element = $(
          '<p><span style="color:' +
            styleLabel +
            '">' +
            source +
            ':</span><span style="color: ' +
            styleText +
            '"> ' +
            text +
            "</span></p>"
        );

      this.showChat();

      if (!this.isActive()) this.hideInput();

      this.hideChat();

      this.log.append(element);
      this.log.scrollTop(99999);
    },

    key(data) {
      var self = this;

      switch (data) {
        case Modules.Keys.Enter:
          if (this.input.val() === "") this.toggle();
          else this.send();

          break;
      }
    },

    send() {
      var self = this;

      this.game.socket.send(Packets.Chat, [this.input.val()]);
      this.toggle();
    },

    toggle() {
      var self = this;

      this.clean();

      if (this.visible && !this.isActive()) this.showInput();
      else if (this.visible) {
        this.hideInput();
        this.hideChat();
      } else {
        this.showChat();
        this.showInput();
      }
    },

    showChat() {
      var self = this;

      this.chat.fadeIn("fast");

      this.visible = true;
    },

    showInput() {
      var self = this;

      this.button.addClass("active");

      this.input.fadeIn("fast");
      this.input.val("");
      this.input.focus();

      this.clean();
    },

    hideChat() {
      var self = this;

      if (this.fadingTimeout) {
        clearTimeout(this.fadingTimeout);
        this.fadingTimeout = null;
      }

      this.fadingTimeout = setTimeout(function() {
        if (!this.isActive()) {
          this.chat.fadeOut("slow");

          this.visible = false;
        }
      }, this.fadingDuration);
    },

    hideInput() {
      var self = this;

      this.button.removeClass("active");

      this.input.val("");
      this.input.fadeOut("fast");
      this.input.blur();

      this.hideChat();
    },

    clean() {
      var self = this;

      clearTimeout(this.fadingTimeout);
      this.fadingTimeout = null;
    },

    isActive() {
      return this.input.is(":focus");
    }
  });
});