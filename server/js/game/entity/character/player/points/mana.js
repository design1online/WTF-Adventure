import Points from './points.js';

export default class Mana extends Points {
  getMana() {
    return this.points;
  }

  getMaxMana() {
    return this.maxPoints;
  }

  setMana(mana) {
    this.points = mana;

    if (this.manaCallback) {
      this.manaCallback();
    }
  }

  setMaxMana(maxMana) {
    this.maxPoints = maxMana;

    if (this.maxManaCallback) {
      this.maxManaCallback();
    }
  }

  onMana(callback) {
    this.manaCallback = callback;
  }

  onMaxMana(callback) {
    this.maxManaCallback = callback;
  }
}
