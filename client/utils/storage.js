'use client';

/* global window */
import log from '../lib/log';
import $ from "jquery";

export default class Storage {
  constructor(client) {
    log.debug('Storage - constructor()', window.localStorage);
    
    this.data = null;

    this.storage = typeof window !== "undefined"
      ? window.localStorage
      : { 
        data: this.data,
        setItem: (key, value) => this.data[key] = value,
        getItem: (key) => this.data[key]
      };

    this.name = 'data';
    this.client = client;
    this.loadStorage();
  }

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

  save() {
    log.debug('Storage - save()');

    if (this.data) {
      this.storage.setItem(this.name, JSON.stringify(this.data));
    }
  }

  clear() {
    log.debug('Storage - clear()');

    this.storage.removeItem(this.name);
    this.data = this.create();
  }

  toggleRemember(toggle) {
    log.debug('Storage - toggleRemember()', toggle);

    this.data.player.rememberMe = toggle;
    this.save();
  }

  setPlayer(option, value) {
    log.debug('Storage - setPlayer()', option, value);

    const pData = this.getPlayer();

    if (pData.hasOwnProperty(option)) { // eslint-disable-line
      pData[option] = value;
    }

    this.save();
  }

  setSettings(option, value) {
    log.debug('Storage - setSettings()', option, value);

    const sData = this.getSettings();

    if (sData.hasOwnProperty(option)) { // eslint-disable-line
      sData[option] = value;
    }

    this.save();
  }

  getPlayer() {
    log.debug('Storage - getPlayer()');
    return this.data.player;
  }

  getSettings() {
    log.debug('Storage - getSettings()');
    return this.data ? this.data.settings : null;
  }
}
