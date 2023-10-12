import $ from 'jquery';

/**
 * Shows an popup overlay when the mouse
 * is over a character or enemy that displays
 * information about them
 * @class
 */
export default class Overlay {
  /**
   * Default constructor
   * @param {Input} input reference to the Input class
   */
  constructor(input) {
    /**
     * Input class
     * @type {Input}
     */
    this.input = input;

    /**
     * A reference to the entity they are hovering over
     * @type {Entity}
     */
    this.hovering = null;

    /**
     * Jquery reference to the attack info box
     * @type {DOMElement}
     */
    this.attackInfo = $('#attackInfo');

    /**
     * Jquery reference to the image section of the attack info box
     * @type {DOMElement}
     */
    this.image = this.attackInfo.find('.image div');

    /**
     * Jquery reference to the name of the attack info box
     * @type {DOMElement}
     */
    this.name = this.attackInfo.find('.name');

    /**
     * Jquery reference to the details of the attack info box
     * @type {DOMElement}
     */
    this.details = this.attackInfo.find('.details');

    /**
     * Jquery reference to the name of the health bar of the
     * attack info box
     * @type {DOMElement}
     */
    this.health = this.attackInfo.find('.health');

    /**
     * A callback for when the overlay is done updating
     * @type {Function}
     */
    this.updateCallback = null;
  }

  /**
   * Update the overlay
   * @param  {Entity} entity The entity they are attacking
   * @return {Boolean} returns false if invalid entity or currently visible
   */
  update(entity) {
    if (!this.validEntity(entity)) {
      this.hovering = null;

      if (this.isVisible()) {
        this.hide();
      }

      return;
    }

    if (!this.isVisible()) {
      this.display();
    }

    this.hovering = entity;

    this.name.html(entity.type === 'player'
      ? entity.username
      : entity.label);

    if (this.hasHealth()) {
      this.health.css({
        display: 'block',
        width: `${Math.ceil((entity.hitPoints / entity.maxHitPoints) * 100) - 10}%`,
      });

      this.details.html(`${entity.hitPoints} / ${entity.maxHitPoints}`);
    } else {
      this.health.css('display', 'none');
      this.details.html('');
    }

    this.onUpdate((entityId, hitPoints) => {
      if (
        this.hovering
        && this.hovering.id === entityId
        && this.hovering.type !== 'npc'
        && this.hovering.type !== 'item'
      ) {
        if (hitPoints < 1) {
          this.hide();
        } else {
          this.health.css(
            'width',
            `${Math.ceil((hitPoints / this.hovering.maxHitPoints) * 100)
              - 10
            }%`,
          );
          this.details.html(`${hitPoints} / ${this.hovering.maxHitPoints}`);
        }
      }
    });
  }

  /**
   * Checks whether or not this is an entity they can
   * interact with
   * @param  {Entity} entity the entity they want to interact with
   * @return {Boolean} Returns true if this is not a player or projectile
   */
  validEntity(entity) {
    return (
      entity
      && entity.id !== this.input.getPlayer().id
      && entity.type !== 'projectile'
    );
  }

  /**
   * Cleans out the details and the entity they're hovering on
   */
  clean() {
    this.details.html('');
    this.hovering = null;
  }

  /**
   * Check if the entity has a health bar
   * @return {Boolean} Rturns true if this entity is a (mob or player)
   */
  hasHealth() {
    return this.hovering.type === 'mob' || this.hovering.type === 'player';
  }

  /**
   * Fades in the attack info
   */
  display() {
    this.attackInfo.fadeIn('fast');
  }

  /**
   * Fades out and hides the attack info
   */
  hide() {
    this.attackInfo.fadeOut('fast');
  }

  /**
   * Check to see if the atttack info is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.attackInfo.css('display') === 'block';
  }

  /**
   * Returns an instance of the game object
   * @return {Game}
   */
  getGame() {
    return this.input.game;
  }

  /**
   * Sets an update callback
   * @param  {Function} callback called when the overlay is updated
   */
  onUpdate(callback) {
    this.updateCallback = callback;
  }
}
