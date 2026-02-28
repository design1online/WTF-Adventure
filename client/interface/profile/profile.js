import $ from 'jquery';
import _ from 'underscore';
import State from './state';
import Ability from './ability';
import Settings from './settings';
import Quest from './quest';
import Packets from '../../network/packets';

/**
 * Manages the player profile dialog, including page navigation and sub-pages
 * @class
 */
export default class Profile {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   */
  constructor(game) {
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The profile dialog body element
     * @type {jQuery}
     */
    this.body = $('#profileDialog');
    /**
     * The HUD profile toggle button element
     * @type {jQuery}
     */
    this.button = $('#profileButton');
    /**
     * The next page navigation button element
     * @type {jQuery}
     */
    this.next = $('#next');
    /**
     * The previous page navigation button element
     * @type {jQuery}
     */
    this.previous = $('#previous');
    /**
     * The currently displayed profile page
     * @type {GamePage}
     */
    this.activePage = null;
    /**
     * The index of the currently displayed profile page
     * @type {Number}
     */
    this.activeIndex = 0;
    /**
     * The list of all profile page instances
     * @type {Array}
     */
    this.pages = [];
    this.loadProfile();
  }

  /**
   * Initializes profile pages and binds navigation and toggle button click handlers
   */
  loadProfile() {
    this.button.click(() => {
      this.game.interface.hideAll();
      this.settings.hide();

      if (this.isVisible()) {
        this.hide();
        this.button.removeClass('active');
      } else {
        this.show();
        this.button.addClass('active');
      }

      if (!this.activePage.loaded) {
        this.activePage.loadPage();
      }

      this.game.socket.send(Packets.Click, [
        'profile',
        this.button.hasClass('active'),
      ]);
    });

    this.next.click(() => {
      if (this.activeIndex + 1 < this.pages.length) this.setPage(this.activeIndex + 1);
      else this.next.removeClass('enabled');
    });

    this.previous.click(() => {
      if (this.activeIndex > 0) this.setPage(this.activeIndex - 1);
      else this.previous.removeClass('enabled');
    });

    /**
     * The state profile page instance
     * @type {State}
     */
    this.state = new State(this.game);
    /**
     * The ability profile page instance
     * @type {Ability}
     */
    this.ability = new Ability(this.game);
    /**
     * The settings profile page instance
     * @type {Settings}
     */
    this.settings = new Settings(this.game);
    /**
     * The quests profile page instance
     * @type {Quest}
     */
    this.quests = new Quest(this.game);
    this.pages.push(this.state, this.quests, this.ability);
    this.activePage = this.state;

    if (this.activeIndex === 0 && this.activeIndex !== this.pages.length) {
      this.next.addClass('enabled');
    }
  }

  /**
   * Calls update on each profile page
   */
  update() {
    _.each(this.pages, (page) => {
      page.update();
    });
  }

  /**
   * Calls resize on each profile page
   */
  resize() {
    _.each(this.pages, (page) => {
      page.resize();
    });
  }

  /**
   * Switches the visible profile page to the one at the given index
   * @param {Number} index the index of the page to display
   */
  setPage(index) {
    const page = this.pages[index];

    this.clear();

    if (page.isVisible()) {
      return;
    }

    this.activePage = page;
    this.activeIndex = index;

    if (this.activeIndex + 1 === this.pages.length) {
      this.next.removeClass('enabled');
    } else if (this.activeIndex === 0) {
      this.previous.removeClass('enabled');
    } else {
      this.previous.addClass('enabled');
      this.next.addClass('enabled');
    }

    page.show();
  }

  /**
   * Shows the profile dialog and marks the button as active
   */
  show() {
    this.body.fadeIn('slow');
    this.button.addClass('active');
  }

  /**
   * Hides the profile dialog, removes the active state, and hides settings
   */
  hide() {
    this.body.fadeOut('fast');
    this.button.removeClass('active');

    if (this.settings) {
      this.settings.hide();
    }
  }

  /**
   * Returns whether the profile dialog is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }

  /**
   * Hides the currently active profile page
   */
  clear() {
    if (this.activePage) {
      this.activePage.hide();
    }
  }

  /**
   * Returns the current scale factor from the game
   * @return {Number}
   */
  getScale() {
    return this.game.getScaleFactor();
  }
}
