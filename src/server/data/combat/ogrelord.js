var Combat = require("../../js/game/entity/character/combat/combat"),
  Messages = require("../../js/network/messages"),
  Packets = require("../../js/network/packets"),
  Modules = require("../../js/util/modules"),
  Utils = require("../../js/util/utils"),
  _ = require("underscore");

module.exports = OgreLord = Combat.extend({
  init(character) {
    var self = this;

    this._super(character);

    this.character = character;

    this.dialogues = [
      "Get outta my swamp",
      "No, not the onion.",
      "My minions give me strength! You stand no chance!"
    ];

    this.minions = [];

    this.lastSpawn = 0;

    this.loaded = false;

    character.projectile = Modules.Projectiles.Boulder;
    character.projectileName = "projectile-boulder";

    character.onDeath(function() {
      this.reset();
    });
  },

  load() {
    var self = this;

    this.talkingInterval = setInterval(function() {
      if (this.character.hasTarget()) this.forceTalk(this.getMessage());
    }, 9000);

    this.updateInterval = setInterval(function() {
      this.character.armourLevel = 50 + this.minions.length * 15;
    }, 2000);

    this.loaded = true;
  },

  hit(character, target, hitInfo) {
    var self = this;

    if (this.isAttacked()) this.beginMinionAttack();

    if (!character.isNonDiagonal(target)) {
      var distance = character.getDistance(target);

      if (distance < 7) {
        hitInfo.isRanged = true;
        character.attackRange = 7;
      }
    }

    if (this.canSpawn()) this.spawnMinions();

    this._super(character, target, hitInfo);
  },

  forceTalk(message) {
    var self = this;

    if (!this.world) return;

    this.world.pushToAdjacentGroups(
      this.character.target.group,
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: this.character.instance,
        text: message,
        nonNPC: true
      })
    );
  },

  getMessage() {
    return this.dialogues[Utils.randomInt(0, this.dialogues.length - 1)];
  },

  spawnMinions() {
    var self = this,
      xs = [414, 430, 415, 420, 429],
      ys = [172, 173, 183, 185, 180];

    this.lastSpawn = new Date().getTime();

    this.forceTalk("Now you shall see my true power!");

    for (var i = 0; i < xs.length; i++)
      this.minions.push(this.world.spawnMob(12, xs[i], ys[i]));

    _.each(this.minions, function(minion) {
      minion.onDeath(function() {
        if (this.isLast()) this.lastSpawn = new Date().getTime();

        this.minions.splice(this.minions.indexOf(minion), 1);
      });

      if (this.isAttacked()) this.beginMinionAttack();
    });

    if (!this.loaded) this.load();
  },

  beginMinionAttack() {
    var self = this;

    if (!this.hasMinions()) return;

    _.each(this.minions, function(minion) {
      var randomTarget = this.getRandomTarget();

      if (!minion.hasTarget() && randomTarget)
        minion.combat.begin(randomTarget);
    });
  },

  reset() {
    var self = this;

    this.lastSpawn = 0;

    var listCopy = this.minions.slice();

    for (var i = 0; i < listCopy.length; i++) this.world.kill(listCopy[i]);

    clearInterval(this.talkingInterval);
    clearInterval(this.updateInterval);

    this.talkingInterval = null;
    this.updateInterval = null;

    this.loaded = false;
  },

  getRandomTarget() {
    var self = this;

    if (this.isAttacked()) {
      var keys = Object.keys(this.attackers),
        randomAttacker = this.attackers[keys[Utils.randomInt(0, keys.length)]];

      if (randomAttacker) return randomAttacker;
    }

    if (this.character.hasTarget()) return this.character.target;

    return null;
  },

  hasMinions() {
    return this.minions.length > 0;
  },

  isLast() {
    return this.minions.length === 1;
  },

  canSpawn() {
    return (
      new Date().getTime() - this.lastSpawn > 50000 &&
      !this.hasMinions() &&
      this.isAttacked()
    );
  }
});