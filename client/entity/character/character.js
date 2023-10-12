import _ from 'underscore';
import Entity from '../entity';
import Transition from '../../utils/transition';
import Animation from '../animation';
import Module from '../../utils/modules';

/**
 * A specific type of {@link Entity}. The base class for a
 * {@link Mob} or {@link Npc} or {@link Player}
 * @class
 */
export default class Character extends Entity {
  /**
   * Default constructor
   * @param {Number} id the ID of the {@link Entity}
   * @param {String} kind the kind of {@link Entity} this is (sprite name)
   * @param {String} label the name to display for the overlay
   */
  constructor(id, kind, label) {
    super(id, kind, label);

    /**
     * Next grid X position
     * @type {Number}
     */
    this.nextGridX = -1;

    /**
     * Next grid Y position
     * @type {Number}
     */
    this.nextGridY = -1;

    /**
     * Previous gridX position
     * @type {Number}
     */
    this.prevGridX = -1;

    /**
     * Previous gridY position
     * @type {Number}
     */
    this.prevGridY = -1;

    /**
     * The direction they are pointing
     * @type {Orientation}
     */
    this.orientation = Module.Orientation.Down;

    /**
     * How many hit points they have left
     * @type {Number}
     */
    this.hitPoints = -1;

    /**
     * How many hit points they have total
     * @type {Number}
     */
    this.maxHitPoints = -1;

    /**
     * How much magic they have left
     * @type {Number}
     */
    this.mana = -1;

    /**
     * How much magic they have total
     * @type {Number}
     */
    this.maxMana = -1;

    /**
     * Is there health bar visible or not
     * @type {Boolean}
     */
    this.healthBarVisible = false;

    /**
     * Does their health reset after time is up
     * @type {Boolean}
     */
    this.healthBarTimeout = false;

    /**
     * Are they dead
     * @type {Boolean}
     */
    this.dead = false;

    /**
     * Are they following something
     * @type {Boolean}
     */
    this.following = false;

    /**
     * Are they attacking something
     * @type {Boolean}
     */
    this.attacking = false;

    /**
     * Should their action be interrupted
     * @type {Boolean}
     */
    this.interrupted = false;

    /**
     * Did they get a critical hit
     * @type {Boolean}
     */
    this.critical = false;

    /**
     * Are they frozen
     * @type {Boolean}
     */
    this.frozen = false;

    /**
     * Are they stunned
     * @type {Boolean}
     */
    this.stunned = false;

    /**
     * Did they explode
     * @type {Boolean}
     */
    this.explosion = false;

    /**
     * What is their current path
     * @type {Astar}
     */
    this.path = null;

    /**
     * What is their current target
     * @type {Entity}
     */
    this.target = null;

    /**
     * An array of things trying to attack them
     * @type {Object}
     */
    this.attackers = {};

    /**
     * Movement transitions
     * @type {Transition}
     */
    this.movement = new Transition();

    /**
     * Idle animation speed
     * @type {Number}
     */
    this.idleSpeed = 450;

    /**
     * Attack animation speed
     * @type {Number}
     */
    this.attackAnimationSpeed = 50;

    /**
     * Walk animation speed
     * @type {Number}
     */
    this.walkAnimationSpeed = 100;

    /**
     * Movement animation speed
     * @type {Number}
     */
    this.movementSpeed = 250;

    /**
     * Do they have a weapon
     * @type {Boolean}
     */
    this.weapon = false;

    /**
     * Do they have a shadow
     * @type {Boolean}
     */
    this.shadow = false;

    /**
     * What is their attack range
     * @type {Number}
     */
    this.attackRange = 1;

    /**
     * Flip the sprite along the X axis
     * @type {Boolean}
     */
    this.spriteFlipX = false;

    /**
     * Flip the sprite along the Y axis
     * @type {Boolean}
     */
    this.spriteFlipY = false;

    /**
     * Location of a new destination during pathing
     * @type {Object}
     */
    this.newDestination = null;

    /**
     * Default step number
     * @type {Number}
     */
    this.step = 0;

    /**
     * Object of adjacent tiles while pathing
     * @type {Object}
     */
    this.adjacentTiles = {};

    /**
     * The X and Y locations of the destination
     * @type {{ gridX: Number, gridY: Number}}
     */
    this.destination = {};

    /**
     * If this character is in terror
     * @type {Boolean}
     */
    this.terror = false;

    /**
     * If this character's pathing is being forced
     * @type {Boolean}
     */
    this.forced = false;

    /**
     * Request path callback
     * @type {Function}
     */
    this.requestPathCallback = null;

    /**
     * Start pathing callback
     * @type {Function}
     */
    this.startPathingCallback = null;

    /**
     * Stop pathing callback
     * @type {Function}
     */
    this.stopPathingCallback = null;

    /**
     * Before step callback
     * @type {Function}
     */
    this.beforeStepCallback = null;

    /**
     * Step callback
     * @type {Function}
     */
    this.stepCallback = null;

    /**
     * Second step callback
     * @type {Function}
     */
    this.secondStepCallback = null;

    /**
     * Move callback
     * @type {Function}
     */
    this.moveCallback = null;

    /**
     * Hit points callback
     * @type {Function}
     */
    this.hitPointsCallback = null;

    /**
     * Global critical animation
     * @type {Animation}
     */
    this.criticalAnimation = null;

    /**
     * Global terror animation
     * @type {Animation}
     */
    this.terrorAnimation = null;

    /**
     * Global stun animation
     * @type {Animation}
     */
    this.stunAnimation = null;

    /**
     * Global explosion animation
     * @type {Animation}
     */
    this.explosionAnimation = null;

    // prep this character by loading global animations
    this.loadGlobals();
  }

  /**
   * Load all global character animations
   */
  loadGlobals() {
    this.criticalAnimation = new Animation('atk_down', 10, 0, 48, 48);
    this.criticalAnimation.setSpeed(30);

    this.criticalAnimation.setCount(1, () => {
      this.critical = false;

      this.criticalAnimation.reset();
      this.criticalAnimation.count = 1;
    });

    this.terrorAnimation = new Animation('explosion', 8, 0, 64, 64);
    this.terrorAnimation.setSpeed(50);

    this.terrorAnimation.setCount(1, () => {
      this.terror = false;

      this.terrorAnimation.reset();
      this.terrorAnimation.count = 1;
    });

    this.stunAnimation = new Animation('atk_down', 6, 0, 48, 48);
    this.stunAnimation.setSpeed(30);

    this.explosionAnimation = new Animation('explosion', 8, 0, 64, 64);
    this.explosionAnimation.setSpeed(50);

    this.explosionAnimation.setCount(1, () => {
      this.explosion = false;

      this.explosionAnimation.reset();
      this.explosionAnimation.count = 1;
    });
  }

  /**
   * Animate the character depending on their current orientation
   * @param {String} animation orientation (atk, walk, or idle)
   * @param {Number} speed how fast to animate in ms
   * @param {Number} count how many times to animate
   * @param {Function} onEndCount callback function once the animation count has ended
   * @return {Null|Void} returns null if the character is dead
   */
  animate(animation, speed, count, onEndCount) {
    const orientationOptions = ['atk', 'walk', 'idle'];
    let updatedPosition = null;

    if (this.currentAnimation && this.currentAnimation.name === 'death') {
      return;
    }

    this.spriteFlipX = false;
    this.spriteFlipY = false;

    if (orientationOptions.indexOf(animation) > -1) {
      const characterOrientation = this.orientation === Module.Orientation.Left
        ? 'right'
        : Module.Orientation.toString(this.orientation);

      updatedPosition = `${animation}_${characterOrientation}`;
      this.spriteFlipX = this.orientation === Module.Orientation.Left;
    }

    this.setAnimation((updatedPosition || animation), speed, count, onEndCount);
  }

  /**
   * Look at a specific character
   * @param  {Character} character the character to look at
   */
  lookAt(character) {
    if (character.gridX > this.gridX) {
      this.setOrientation(Module.Orientation.Right);
    } else if (character.gridX < this.gridX) {
      this.setOrientation(Module.Orientation.Left);
    } else if (character.gridY > this.gridY) {
      this.setOrientation(Module.Orientation.Down);
    } else if (character.gridY < this.gridY) {
      this.setOrientation(Module.Orientation.Up);
    }

    this.idle();
  }

  /**
   * Follow a specific character
   * @param  {Character} character the character to follow
   */
  follow(character) {
    console.log('canvas follow', character);
    this.following = true;

    this.setTarget(character);
    this.move(character.gridX, character.gridY);
  }

  /**
   * Attack a specific character
   * @param  {Character} attacker  who is the one attacking (unused currently??)
   * @param  {Character} character the character that should be attacked and followed
   */
  attack(attacker, character) {
    this.attacking = true;
    // @TODO add an attacker? not sure why we're not doing this here but we do in addAttacker??
    // this.attackers[attacker.instance] = character;
    this.follow(character);
  }

  /**
   * Stop following or attacking another character
   */
  backOff() {
    this.attacking = false;
    this.following = false;

    this.removeTarget();
  }

  /**
   * Add an attacker to a character
   * @param {Character} character who is attacking them
   * @return {Boolean} false if they are already attacking this character
   */
  addAttacker(character) {
    if (this.hasAttacker(character)) {
      return false;
    }

    this.attackers[character.instance] = character;
    return true;
  }

  /**
   * Removes an attacker from a character
   * @param  {Character} character who should stop attacking them
   * @return {Boolean} true if deleted, false if not found
   */
  removeAttacker(character) {
    if (this.hasAttacker(character)) {
      return delete this.attackers[character.id];
    }

    return false;
  }

  /**
   * Check if they are already being attacked by this character
   * @param  {Character} character who to check if they are currently an attacker
   * @return {Boolean} false if not currently attacking this character
   */
  hasAttacker(character) {
    if (this.attackers.size === 0) {
      return false;
    }

    return character.instance in this.attackers;
  }

  /**
   * Set a specific animation action
   * @param  {Number} orientation an orientation {@link Modules}
   * @param  {Number} action an action {@link Modules}
   */
  performAction(orientation, action) {
    this.setOrientation(orientation);

    switch (action) {
      case Module.Actions.Idle:
        this.animate('idle', this.idleSpeed);
        break;

      case Module.Actions.Attack:
        this.animate('atk', this.attackAnimationSpeed, 1);
        break;

      case Module.Actions.Walk:
        this.animate('walk', this.walkAnimationSpeed);
        break;
      default:
        break;
    }
  }

  /**
   * Set the idle animation and optional orientation direction
   * @param  {Number} direction an orientation {@link Modules}
   */
  idle(direction) {
    const orientation = direction || this.orientation;

    this.performAction(orientation, Module.Actions.Idle);
  }

  /**
   * Go to a specific x,y value
   * @param  {Number}  x grid x coordinate
   * @param  {Number}  y grid y coordinate
   * @param  {Boolean} forced whether or not to force ths action
   * @return {Boolean} false if movement fails
   */
  go(x, y, forced) {
    if (this.frozen) {
      return false;
    }

    if (this.following) {
      this.following = false;
      this.target = null;
    }

    return this.move(x, y, forced);
  }

  /**
   * Set a new destination during movement somewhere
   * @param  {Number} x grid X coordinate
   * @param  {Number} y grid Y coordinate
   */
  proceed(x, y) {
    this.newDestination = {
      x,
      y,
    };
  }

  /**
   * We can have the movement remain client side because
   * the server side will be responsible for determining
   * whether or not the player should have reached the
   * location and ban all hackers. That and the fact
   * the movement speed is constantly updated to avoid
   * hacks previously present in BrowserQuest.
   * @return {Boolean} false if there is no more steps in the path
   */
  nextStep() {
    let stop = false;
    let path;

    if (this.step % 2 === 0 && this.secondStepCallback) {
      this.secondStepCallback();
    }

    this.prevGridX = this.gridX;
    this.prevGridY = this.gridY;

    if (!this.hasPath()) {
      return false;
    }

    if (this.beforeStepCallback) {
      this.beforeStepCallback();
    }

    this.updateGridPosition();

    if (!this.interrupted) {
      if (this.hasNextStep()) {
        this.nextGridX = this.path[this.step + 1][0]; // eslint-disable-line
        this.nextGridY = this.path[this.step + 1][1]; // eslint-disable-line
      }

      if (this.stepCallback) {
        this.stepCallback();
      }

      // path has changed
      if (this.changedPath()) {
        const { x, y } = this.newDestination;

        path = this.requestPathfinding(x, y);

        if (!path) {
          return false;
        }

        this.newDestination = null;

        if (path.length < 2) {
          stop = true;
        } else {
          this.followPath(path);
        }
      } else if (this.hasNextStep()) { // there is a next step available
        this.step += 1;
        this.updateMovement();
      } else { // stop movement
        stop = true;
      }
    } else { // not interrupted, stop movement
      stop = true;
      this.interrupted = false;
    }

    if (stop) { // stop pathing
      this.path = null;
      this.idle();

      if (this.stopPathingCallback) {
        this.stopPathingCallback(this.gridX, this.gridY, this.forced);
      }

      if (this.forced) {
        this.forced = false;
      }
    }

    return true;
  }

  /**
   * Update movement on the path
   */
  updateMovement() {
    const { step, path } = this;

    if (path[step][0] < path[step - 1][0]) {
      this.performAction(Module.Orientation.Left, Module.Actions.Walk);
    }

    if (path[step][0] > path[step - 1][0]) {
      this.performAction(Module.Orientation.Right, Module.Actions.Walk);
    }

    if (path[step][1] < path[step - 1][1]) {
      this.performAction(Module.Orientation.Up, Module.Actions.Walk);
    }

    if (path[step][1] > path[step - 1][1]) {
      this.performAction(Module.Orientation.Down, Module.Actions.Walk);
    }
  }

  /**
   * Taken from TTA - this is to ensure the player
   * does not click on himself or somehow into another
   * dimension
   * @param {Array} path the path the character is taking as they move
   * @return {Boolean} false if the path is too short or no next step
   */
  followPath(path) {
    if (!path || path.length < 2) {
      return false;
    }

    this.path = path;
    this.step = 0;

    if (this.following) {
      path.pop();
    }

    if (this.startPathingCallback) {
      this.startPathingCallback(path);
    }

    return this.nextStep();
  }

  /**
   * Move the character to a new location
   * @param  {Number} x grid X coordinate
   * @param  {Number} y grid Y coordinate
   * @param  {Boolean} forced whether or not to force the movement
   */
  move(x, y, forced) {
    this.destination = {
      gridX: x,
      gridY: y,
    };

    this.adjacentTiles = {};

    if (this.hasPath() && !forced) {
      this.proceed(x, y);
    } else {
      this.followPath(this.requestPathfinding(x, y));
    }
  }

  /**
   * Stop the character movement
   * @param  {Boolean} force force them to stop
   */
  stop(force) {
    if (!force) {
      this.interrupted = true;
    } else if (this.hasPath()) {
      this.path = null;
      this.newDestination = null;
      this.movement = new Transition();
      this.performAction(this.orientation, Module.Actions.Idle);
      this.nextGridX = this.gridX;
      this.nextGridY = this.gridY;
    }
  }

  /**
   * Get the correct effect animation
   * @return {String} animation name
   */
  getEffectAnimation() {
    if (this.critical) {
      return this.criticalAnimation;
    }

    if (this.stunned) {
      return this.stunAnimation;
    }

    if (this.terror) {
      return this.terrorAnimation;
    }

    if (this.explosion) {
      return this.explosionAnimation;
    }

    return null;
  }

  /**
   * Return the active effect on the character
   * @return {String} the effect in place on the character
   */
  getActiveEffect() {
    if (this.critical) {
      return 'criticaleffect';
    }

    if (this.stunned) {
      return 'stuneffect';
    }

    if (this.terror) {
      return 'explosion-terror';
    }

    if (this.explosion) {
      return 'explosion-fireball';
    }

    return null;
  }

  /**
   * The triggered health bar (currently fighting)
   */
  triggerHealthBar() {
    this.healthBarVisible = true;

    if (this.healthBarTimeout) {
      clearTimeout(this.healthBarTimeout);
    }

    this.healthBarTimeout = setTimeout(() => {
      this.healthBarVisible = false;
    }, 7000);
  }

  /**
   * Clear the health bar from the screen
   */
  clearHealthBar() {
    this.healthBarVisible = false;
    clearTimeout(this.healthBarTimeout);
    this.healthBarTimeout = null;
  }

  /**
   * Request path finding from current position to this position
   * @param  {Number} x grid X coordinate
   * @param  {Number} y grid Y coordinate
   * @return {Array} valid path or null
   */
  requestPathfinding(x, y) {
    if (this.requestPathCallback) {
      return this.requestPathCallback(x, y);
    }

    return null;
  }

  /**
   * Update the character's position on the grid
   */
  updateGridPosition() {
    this.setGridPosition(this.path[this.step][0], this.path[this.step][1]);
  }

  /**
   * Check if the character is currently moving
   * @return {Boolean} true if moving
   */
  isMoving() {
    return (
      this.currentAnimation.name === 'walk'
      && (this.x % 2 !== 0 || this.y % 2 !== 0)
    );
  }

  /**
   * Apply a callback to each attacker
   * @param  {Function} callback function to apply to each attacker
   */
  forEachAttacker(callback) {
    _.each(this.attackers, (attacker) => {
      callback(attacker);
    });
  }

  /**
   * Check if they are being attacked
   * @return {Boolean} returns true if they have any attackers
   */
  isAttacked() {
    return Object.keys(this.attackers).length > 0;
  }

  /**
   * Returns true if they have a weapon
   * @return {Boolean}
   */
  hasWeapon() {
    return this.weapon;
  }

  /**
   * Returns true if they have a shadow
   * @return {Boolean}
   */
  hasShadow() {
    return this.shadow;
  }

  /**
   * Returns true if they are targeting someone
   * @return {Boolean}
   */
  hasTarget() {
    return !(this.target === null);
  }

  /**
   * Returns true if they have a path
   * @return {Boolean}
   */
  hasPath() {
    return this.path !== null;
  }

  /**
   * Returns true if they have a next path step
   * @return {Boolean}
   */
  hasNextStep() {
    return this.path.length - 1 > this.step;
  }

  /**
   * Returns true if they've changed paths
   * @return {[type]}
   */
  changedPath() {
    return !!this.newDestination;
  }

  /**
   * Returns true if the target was removed
   * @return {Boolean}
   */
  removeTarget() {
    if (!this.target) {
      return false;
    }

    this.target = null;
    return true;
  }

  /**
   * Removes all attakers
   */
  forget() {
    this.attackers = {};
  }

  /**
   * The character has moved, trigger the move callback if there is one
   */
  moved() {
    this.loadDirty();

    if (this.moveCallback) {
      this.moveCallback();
    }
  }

  /**
   * Sets a target for this character
   * @param {Character} target the character to target
   */
  setTarget(target) {
    console.log('canvas setting target', target);
    if (target === null) {
      this.removeTarget();
      return;
    }

    // they are already targeting this character
    if (this.target && this.target.id === target.id) {
      console.log('canvas already has this target');
      return;
    }

    // remove any old targets
    if (this.hasTarget()) {
      console.log('canvas removing old target');
      this.removeTarget();
    }

    this.target = target;
  }

  /**
   * Set the character's hit points then triggers hitPointsCallback
   * @param {Number} hitPoints how many hit points they caused
   */
  setHitPoints(hitPoints) {
    this.hitPoints = hitPoints;

    if (this.hitPointsCallback) {
      this.hitPointsCallback(this.hitPoints);
    }
  }

  /**
   * Set the character's maximum hit points
   * @param {Number} maxHitPoints how much HP total
   */
  setMaxHitPoints(maxHitPoints) {
    this.maxHitPoints = maxHitPoints;
  }

  /**
   * Set the character's orientation
   * @param {String} orientation which direction {@link Modules}
   */
  setOrientation(orientation) {
    this.orientation = orientation;
  }

  /**
   * Callback for path requested
   * @param  {Function} callback
   */
  onRequestPath(callback) {
    this.requestPathCallback = callback;
  }

  /**
   * Start pathing callback
   * @param  {Function} callback
   */
  onStartPathing(callback) {
    this.startPathingCallback = callback;
  }

  /**
   * Stop pathing callback
   * @param  {Function} callback
   */
  onStopPathing(callback) {
    this.stopPathingCallback = callback;
  }

  /**
   * Before a pathing step callback
   * @param  {Function} callback
   */
  onBeforeStep(callback) {
    this.beforeStepCallback = callback;
  }

  /**
   * Pathing step callback
   * @param  {Function} callback
   */
  onStep(callback) {
    this.stepCallback = callback;
  }

  /**
   * Second step callback
   * @param  {Function} callback
   */
  onSecondStep(callback) {
    this.secondStepCallback = callback;
  }

  /**
   * On move callback
   * @param  {Function} callback
   */
  onMove(callback) {
    this.moveCallback = callback;
  }

  /**
   * On hit points callback
   * @param  {Function} callback
   */
  onHitPoints(callback) {
    this.hitPointsCallback = callback;
  }
}
