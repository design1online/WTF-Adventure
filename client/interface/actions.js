import $ from 'jquery';

export default class Actions {
  constructor(intrfce) {
    this.interface = intrfce;

    this.body = $('#actionContainer');
    this.drop = $('#dropDialog');
    this.dropInput = $('#dropCount');

    this.pBody = $('#pActions');
    this.follow = $('#follow');
    this.trade = $('#tradeAction');

    this.activeClass = null;

    this.miscButton = null;

    this.loadActions();
  }

  loadActions() {
    const dropAccept = $('#dropAccept');
    const dropCancel = $('#dropcancel');

    dropAccept.click((event) => {
      if (this.activeClass === 'inventory') {
        this.interface.inventory.clickAction(event);
      }
    });

    dropCancel.click((event) => {
      if (this.activeClass === 'inventory') {
        this.interface.inventory.clickAction(event);
      }
    });
  }

  loadDefaults(activeClass) {
    this.activeClass = activeClass;

    switch (this.activeClass) {
      default:
        break;
      case 'inventory':
        const dropButton = $('<div id="drop" class="actionButton">Drop</div>'); // eslint-disable-line
        this.add(dropButton);
        break;

      case 'profile':
        break;
    }
  }

  add(button, misc) {
    this.body.find('ul').prepend($('<li></li>').append(button));

    button.click((event) => {
      if (this.activeClass === 'inventory') {
        this.interface.inventory.clickAction(event);
      }
    });

    if (misc) {
      this.miscButton = button;
    }
  }

  removeMisc() {
    this.miscButton.remove();
    this.miscButton = null;
  }

  reset() {
    const buttons = this.getButtons();

    for (let i = 0; i < buttons.length; i += 1) {
      $(buttons[i]).remove();
    }
  }

  show() {
    this.body.fadeIn('fast');
  }

  showPlayerActions(player, mouseX, mouseY) {
    if (!player) return;

    this.pBody.fadeIn('fast');
    this.pBody.css({
      left: `${mouseX - this.pBody.width() / 2}px`,
      top: `${mouseY + this.pBody.height() / 2}px`,
    });

    this.follow.click(() => {
      this.getPlayer().follow(player);

      this.hidePlayerActions();
    });

    this.trade.click(() => {
      this.getGame().tradeWith(player);

      this.hidePlayerActions();
    });
  }

  hide() {
    this.body.fadeOut('slow');
  }

  hidePlayerActions() {
    this.pBody.fadeOut('fast');
  }

  displayDrop(activeClass) {
    this.activeClass = activeClass;
    this.drop.fadeIn('fast');
    this.dropInput.focus();
    this.dropInput.select();
  }

  hideDrop() {
    this.drop.fadeOut('slow');
    this.dropInput.blur();
    this.dropInput.val('');
  }

  getButtons() {
    return this.body.find('ul').find('li');
  }

  getGame() {
    return this.interface.game;
  }

  getPlayer() {
    return this.interface.game.player;
  }

  isVisible() {
    return this.body.css('display') === 'block';
  }
}
