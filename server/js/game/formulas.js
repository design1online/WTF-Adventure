import Utils from '../util/utils.js';

const LevelExp = [];

const getMaxDamage = (attacker, target) => {
  if (!attacker || !target) {
    return 0;
  }

  let damageDealt;
  let damageAbsorbed;
  let damageAmplifier = 1;
  let absorptionAmplifier = 1;

  const usingRange = attacker.weapon
    ? attacker.weapon.isRanged()
    : attacker.isRanged();

  const weaponLevel = attacker.weapon
    ? attacker.weapon.getLevel()
    : attacker.weaponLevel;

  const armourLevel = attacker.armour
    ? attacker.armour.getDefense()
    : attacker.armourLevel;

  const pendant = attacker.pendant ? attacker.pendant : null;
  const ring = attacker.ring ? attacker.ring : null;
  const boots = attacker.boots ? attacker.boots : null;

  const targetArmour = target.armour
    ? target.armour.getDefense()
    : target.armourLevel;

  const targetPendant = target.pendant ? target.pendant : null;
  const targetRing = target.ring ? target.ring : null;
  const targetBoots = target.boots ? target.boots : null;
  const isPlayer = attacker.type === 'player';

  damageDealt = (isPlayer ? 10 : 0)
    + attacker.level
    + (attacker.level * weaponLevel) / 4
    + (attacker.level + weaponLevel * armourLevel) / 8;

  /**
   * Apply ranged damage deficit
   */

  if (usingRange) {
    damageDealt /= 1.275;
  }

  /**
   * Apply special amulets
   */

  if (pendant && pendant.pendantLevel > 0) {
    damageAmplifier *= pendant.getBaseAmplifier();
  }

  if (ring && ring.ringLevel > 0) {
    damageAmplifier *= ring.getBaseAmplifier();
  }

  if (boots && boots.bootsLevel > 0) {
    damageAmplifier *= boots.getBaseAmplifier();
  }

  /**
   * Just so amplifiers don't get out of hand.
   */

  if (damageAmplifier > 1.6) {
    damageAmplifier = 1.6;
  }

  damageDealt *= damageAmplifier;

  damageAbsorbed = target.level + targetArmour / 2;

  if (targetPendant) {
    absorptionAmplifier *= targetPendant.getBaseAmplifier();
  }

  if (targetRing) {
    absorptionAmplifier *= targetRing.getBaseAmplifier();
  }

  if (targetBoots) {
    absorptionAmplifier *= targetBoots.getBaseAmplifier();
  }

  damageAbsorbed *= absorptionAmplifier;

  let damage = damageDealt - damageAbsorbed;

  damage = Math.ceil(damage);

  if (isNaN(damage) || !damage || damage < 0) {
    damage = 0;
  }

  return damage;
};

const getDamage = (attacker, target, special) => {
  const maxDamage = getMaxDamage(attacker, target, special);
  const accuracy = Utils.randomInt(0, attacker.level);
  return Utils.randomInt(accuracy, maxDamage);
};

/**
 * The critical is the player's max hit plus *= critical multiplier of the weapon
 */
const getCritical = (attacker, target) => {
  if (!attacker || !target) {
    return 0;
  }

  let damage = getDamage(attacker, target);
  const multiplier = attacker.weapon.abilityLevel / 10;
  damage *= multiplier;

  return damage;
};

const getWeaponBreak = (attacker, target) => {
  if (!attacker || !target) {
    return false;
  }

  const targetArmour = target.getArmourLevel();
  const breakOnArmour = 100 - (targetArmour * 10);

  /**
   * The chance a weapon will break ....
   * based upon the 100 - (armourLevel * 10)
   * this will never be lower than 35
   */
  const breakChance = Utils.randomRange(1, (breakOnArmour > 35 || 35));

  return breakChance < 25;
};

/**
 * Preliminary setup until this function is expanded
 * and fits in the necessary algorithms.
 */
const getAoEDamage = (attacker, target) => getDamage(attacker, target);

const expToLevel = (experience) => {
  if (experience < 0) {
    return -1;
  }

  for (let i = 1; i < LevelExp.length; i += 1) {
    if (experience < LevelExp[i]) {
      return i;
    }
  }

  return -1;
};

const getMaxHitPoints = level => 100 + level * 30;

const getMaxMana = level => 10 + level * 8;

export default {
  LevelExp,
  getDamage,
  getMaxDamage,
  getCritical,
  getWeaponBreak,
  getMaxHitPoints,
  getMaxMana,
  expToLevel,
  getAoEDamage,
};
