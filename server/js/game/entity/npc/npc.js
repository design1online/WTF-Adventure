import Entity from '../entity.js';

export default class NPC extends Entity {
  constructor(id, instance, x, y) {
    super(id, 'npc', instance, x, y);
    this.talkIndex = 0;
  }

  talk(messages) {
    if (this.talkIndex > messages.length) {
      this.talkIndex = 0;
    }

    this.talkIndex += 1;
  }
}
