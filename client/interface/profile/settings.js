import $ from 'jquery';
import GamePage from './gamePage';

/**
 * Manages the settings profile page for audio, visual, and gameplay options
 * @class
 */
export default class Settings extends GamePage {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   */
  constructor(game) {
    super('#settingsPage');
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The audio manager instance
     * @type {Audio}
     */
    this.audio = game.audio;
    /**
     * The local storage manager instance
     * @type {Storage}
     */
    this.storage = game.storage;
    /**
     * The renderer instance
     * @type {Renderer}
     */
    this.renderer = game.renderer;
    /**
     * The camera instance from the renderer
     * @type {Camera}
     */
    this.camera = game.renderer.camera;
    /**
     * The settings toggle button element
     * @type {jQuery}
     */
    this.button = $('#settingsButton');
    /**
     * The music volume range input element
     * @type {jQuery}
     */
    this.volume = $('#volume');
    /**
     * The sound effects volume range input element
     * @type {jQuery}
     */
    this.sfx = $('#sfx');
    /**
     * The brightness range input element
     * @type {jQuery}
     */
    this.brightness = $('#brightness');
    /**
     * The intensity range input element
     * @type {jQuery}
     */
    this.intensity = $('#intensity');
    /**
     * The info display element
     * @type {jQuery}
     */
    this.info = $('#info');
    /**
     * The sound enabled toggle checkbox element
     * @type {jQuery}
     */
    this.soundCheck = $('#soundCheck');
    /**
     * The center camera toggle checkbox element
     * @type {jQuery}
     */
    this.cameraCheck = $('#cameraCheck');
    /**
     * The debug mode toggle checkbox element
     * @type {jQuery}
     */
    this.debugCheck = $('#debugCheck');
    /**
     * The auto-centre toggle checkbox element
     * @type {jQuery}
     */
    this.centreCheck = $('#centreCheck');
    /**
     * The show player names toggle checkbox element
     * @type {jQuery}
     */
    this.nameCheck = $('#nameCheck');
    /**
     * The show player levels toggle checkbox element
     * @type {jQuery}
     */
    this.levelCheck = $('#levelCheck');
    /**
     * Whether the settings page has been fully loaded
     * @type {Boolean}
     */
    this.loaded = false;
    this.loadSettings();
  }

  /**
   * Initializes all settings controls from stored values and binds change handlers
   */
  loadSettings() {
    if (this.loaded) {
      return;
    }

    this.volume.val(this.getMusicLevel());
    this.sfx.val(this.getSFXLevel());
    this.brightness.val(this.getBrightness());
    this.intensity.val(this.getIntensity());

    this.game.client.updateRange(this.volume);
    this.game.client.updateRange(this.sfx);
    this.game.client.updateRange(this.brightness);
    this.game.client.updateRange(this.intensity);

    this.renderer.adjustBrightness(this.getBrightness());

    this.button.click(() => {
      this.game.interface.hideAll();
      this.button.toggleClass('active');

      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
    });

    this.volume.on('input', () => {
      if (this.audio.song) {
        this.audio.song.volume = this.value / 100;
      }
    });

    this.brightness.on('input', () => {
      this.renderer.adjustBrightness(this.value);
    });

    this.volume.change(() => {
      this.setMusicLevel(this.value);
    });

    this.sfx.change(() => {
      this.setSFXLevel(this.value);
    });

    this.brightness.change(() => {
      this.setBrightness(this.value);
    });

    this.intensity.change(() => {
      this.setIntensity(this.value);
    });

    this.soundCheck.click(() => {
      const isActive = this.soundCheck.hasClass('active');

      this.setSound(!isActive);

      if (isActive) {
        this.audio.reset(this.audio.song);
        this.audio.song = null;
        this.soundCheck.removeClass('active');
      } else {
        this.audio.update();
        this.soundCheck.addClass('active');
      }
    });

    this.cameraCheck.click(() => {
      const active = this.cameraCheck.hasClass('active');

      if (active) {
        this.renderer.camera.decenter();
      } else {
        this.renderer.camera.center();
      }
      this.cameraCheck.toggleClass('active');
      this.setCamera(!active);
    });

    this.debugCheck.click(() => {
      const active = this.debugCheck.hasClass('active');
      this.debugCheck.toggleClass('active');
      this.renderer.debugging = !active;
      this.setDebug(!active);
    });

    this.centreCheck.click(() => {
      const active = this.centreCheck.hasClass('active');
      this.centreCheck.toggleClass('active');
      this.renderer.autoCentre = !active;
      this.setCentre(!active);
    });

    this.nameCheck.click(() => {
      const active = this.nameCheck.hasClass('active');
      this.nameCheck.toggleClass('active');
      this.renderer.drawNames = !active;
      this.setName(!active);
    });

    this.levelCheck.click(() => {
      const active = this.levelCheck.hasClass('active');
      this.levelCheck.toggleClass('active');
      this.renderer.drawLevels = !active;
      this.setName(!active);
    });

    if (this.getSound()) {
      this.soundCheck.addClass('active');
    }

    if (this.getCamera()) {
      this.cameraCheck.addClass('active');
    } else {
      this.camera.centered = false;
      this.renderer.verifyCentration();
    }

    if (this.getDebug()) {
      this.debugCheck.addClass('active');
      this.renderer.debugging = true;
    }

    if (this.getCentreCap()) {
      this.centreCheck.addClass('active');
    }

    if (this.getName()) {
      this.nameCheck.addClass('active');
    } else {
      this.renderer.drawNames = false;
    }

    if (this.getLevel()) {
      this.levelCheck.addClass('active');
    } else {
      this.renderer.drawLevels = false;
    }

    this.loaded = true;
  }

  /**
   * Shows the settings page with a slow fade-in
   */
  show() {
    this.body.fadeIn('slow');
  }

  /**
   * Hides the settings page with a fast fade-out
   */
  hide() {
    this.body.fadeOut('fast');
  }

  /**
   * Persists the music volume level to storage
   * @param {Number} musicLevel the music volume level to save
   */
  setMusicLevel(musicLevel) {
    this.storage.data.settings.music = musicLevel;
    this.storage.save();
  }

  /**
   * Persists the SFX volume level to storage
   * @param {Number} sfxLevel the SFX volume level to save
   */
  setSFXLevel(sfxLevel) {
    this.storage.data.settings.sfx = sfxLevel;
    this.storage.save();
  }

  /**
   * Persists the brightness value to storage
   * @param {Number} brightness the brightness value to save
   */
  setBrightness(brightness) {
    this.storage.data.settings.brightness = brightness;
    this.storage.save();
  }

  /**
   * Persists the intensity value to storage after converting from slider range
   * @param {Number} intensity the raw intensity slider value to convert and save
   */
  setIntensity(intensity) {
    const converted = (10 - intensity) / 10;
    this.storage.data.intensity = converted;
    this.storage.save();
  }

  /**
   * Persists the sound enabled state to storage
   * @param {Boolean} state true to enable sound, false to disable
   */
  setSound(state) {
    this.storage.data.settings.soundEnabled = state;
    this.storage.save();
  }

  /**
   * Persists the center camera state to storage
   * @param {Boolean} state true to enable center camera, false to disable
   */
  setCamera(state) {
    this.storage.data.settings.centerCamera = state;
    this.storage.save();
  }

  /**
   * Persists the debug mode state to storage
   * @param {Boolean} state true to enable debug mode, false to disable
   */
  setDebug(state) {
    this.storage.data.settings.debug = state;
    this.storage.save();
  }

  /**
   * Persists the auto-centre state to storage
   * @param {Boolean} state true to enable auto-centre, false to disable
   */
  setCentre(state) {
    this.storage.data.settings.autoCentre = state;
    this.storage.save();
  }

  /**
   * Persists the show names state to storage
   * @param {Boolean} state true to show player names, false to hide
   */
  setName(state) {
    this.storage.data.settings.showNames = state;
    this.storage.save();
  }

  /**
   * Persists the show levels state to storage
   * @param {Boolean} state true to show player levels, false to hide
   */
  setLevel(state) {
    this.storage.data.settings.showLevels = state;
    this.storage.save();
  }

  /**
   * Returns the stored music volume level
   * @return {Number}
   */
  getMusicLevel() {
    return this.storage.data.settings.music;
  }

  /**
   * Returns the stored SFX volume level
   * @return {Number}
   */
  getSFXLevel() {
    return this.storage.data.settings.sfx;
  }

  /**
   * Returns the stored brightness value
   * @return {Number}
   */
  getBrightness() {
    return this.storage.data.settings.brightness;
  }

  /**
   * Returns the intensity as a slider value converted from the stored fraction
   * @return {Number}
   */
  getIntensity() {
    return (1 - this.storage.data.intensity) * 10;
  }

  /**
   * Returns whether sound is enabled
   * @return {Boolean}
   */
  getSound() {
    return this.storage.data.settings.soundEnabled;
  }

  /**
   * Returns whether the center camera option is enabled
   * @return {Boolean}
   */
  getCamera() {
    return this.storage.data.settings.centerCamera;
  }

  /**
   * Returns whether debug mode is enabled
   * @return {Boolean}
   */
  getDebug() {
    return this.storage.data.settings.debug;
  }

  /**
   * Returns whether the auto-centre cap option is enabled
   * @return {Boolean}
   */
  getCentreCap() {
    return this.storage.data.settings.autoCentre;
  }

  /**
   * Returns whether player names are shown
   * @return {Boolean}
   */
  getName() {
    return this.storage.data.settings.showNames;
  }

  /**
   * Returns whether player levels are shown
   * @return {Boolean}
   */
  getLevel() {
    return this.storage.data.settings.showLevels;
  }

  /**
   * Returns whether the settings page is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }
}
