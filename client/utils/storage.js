'use client';

/* global window */
import log from '../lib/log';
import $ from "jquery";

/**
 * Manages persistent client-side storage using localStorage
 * @class
 */
export default class Storage {
  /**
   * Default constructor
   * @param {Object} client an instance of the game client
   */
  constructor(client) {
    log.debug('Storage - constructor()', window.localStorage);

    /**
     * The parsed storage data object
     * @type {Object}
     */
    this.data = null;

    /**
     * The underlying storage backend (localStorage or in-memory fallback)
     * @type {Object}
     */
    this.storage = typeof window !== "undefined"
      ? window.localStorage
      : {
        data: this.data,
        setItem: (key, value) => this.data[key] = value,
        getItem: (key) => this.data[key]
      };

    /**
     * The key used to identify stored data in the storage backend
     * @type {String}
     */
    this.name = 'data';
    /**
     * Reference to the game client instance
     * @type {Object}
     */
    this.client = client;
    this.loadStorage();
  }

  /**
   * Loads data from storage, or creates a fresh data object if none exists or version has changed
   */
  loadStorage() {
    log.debug('Storage - loadStorage()', this.storage);

    if (this.storage && this.storage.data) {
      this.data = JSON.parse(this.storage.getItem(this.name));
    } else {
      this.data = this.create();
    }

    if (this.data.clientVersion !== this.client.config.version) {
      this.data = this.create();
      this.save();
    }
  }

  /**
   * Creates and returns a fresh default data object
   * @return {Object}
   */
  create() {
    log.debug('Storage - create()');

    return {
      new: true,
      welcome: true,
      clientVersion: this.client.config.version,
      intensity: 0.8,
      player: {
        username: '',
        password: '',
        autoLogin: false,
        rememberMe: false,
      },

      settings: {
        music: 100,
        sfx: 100,
        brightness: 100,
        soundEnabled: true,
        FPSCap: true,
        centerCamera: true,
        debug: false,
        showNames: true,
        showLevels: true,
      },
    };
  }

  /**
   * Persists the current data object to the storage backend
   */
  save() {
    log.debug('Storage - save()');

    if (this.data) {
      this.storage.setItem(this.name, JSON.stringify(this.data));
    }
  }

  /**
   * Removes stored data from the backend and resets to defaults
   */
  clear() {
    log.debug('Storage - clear()');

    this.storage.removeItem(this.name);
    this.data = this.create();
  }

  /**
   * Sets or clears the remember-me flag for the stored player
   * @param {Boolean} toggle whether to enable or disable the remember-me setting
   */
  toggleRemember(toggle) {
    log.debug('Storage - toggleRemember()', toggle);

    this.data.player.rememberMe = toggle;
    this.save();
  }

  /**
   * Updates a single player data field by key and saves
   * @param {String} option the player data field to update
   * @param {*} value the value to set
   */
  setPlayer(option, value) {
    log.debug('Storage - setPlayer()', option, value);

    const pData = this.getPlayer();

    if (pData.hasOwnProperty(option)) { // eslint-disable-line
      pData[option] = value;
    }

    this.save();
  }

  /**
   * Updates a single settings field by key and saves
   * @param {String} option the settings field to update
   * @param {*} value the value to set
   */
  setSettings(option, value) {
    log.debug('Storage - setSettings()', option, value);

    const sData = this.getSettings();

    if (sData.hasOwnProperty(option)) { // eslint-disable-line
      sData[option] = value;
    }

    this.save();
  }

  /**
   * Returns the stored player data object
   * @return {Object}
   */
  getPlayer() {
    log.debug('Storage - getPlayer()');
    return this.data.player;
  }

  /**
   * Returns the stored settings object, or null if no data is loaded
   * @return {Object}
   */
  getSettings() {
    log.debug('Storage - getSettings()');
    return this.data ? this.data.settings : null;
  }
}
