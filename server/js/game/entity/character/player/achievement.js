import Data from '../../../../../data/achievements.json' assert { type: 'json' };
import Messages from '../../../../network/messages.js';
import Packets from '../../../../network/packets.js';
import Modules from '../../../../util/modules.js';

/**
 * TODO: Change the conditionals to use Modules to clarify what is done where.
 */
export default class Achievement {
  constructor(id, player) {
    this.id = id;
    this.player = player;
    this.progress = 0;
    this.data = Data[this.id];
    this.name = this.data.name;
    this.description = this.data.description;
    this.discovered = false;
  }

  step() {
    if (this.isThreshold()) {
      return;
    }

    this.progress += 1;
    this.update();

    this.player.send(
      new Messages.Quest(
        Packets.QuestOpcode.Progress, {
          id: this.id,
          name: this.name,
          progress: this.progress - 1,
          count: this.data.count,
          isQuest: false,
        },
      ),
    );
  }

  converse(npc) {
    if (this.isThreshold() || this.hasItem()) {
      this.finish(npc);
    } else {
      npc.talk(this.data.text);

      this.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: this.data.text,
        }),
      );

      if (!this.isStarted() && npc.talkIndex > this.data.text.length) {
        this.step();
      }
    }
  }

  finish(npc) {
    const {
      rewardType,
    } = this.data;

    switch (rewardType) {
      default:
        break;
      case Modules.Achievements.Rewards.Item:
        if (!this.player.inventory.hasSpace()) {
          this.player.notify(
            'You do not have enough space in your inventory to finish this achievement.',
          );
          return;
        }

        this.player.inventory.add({
          id: this.data.item,
          count: this.data.itemCount,
        });

        break;

      case Modules.Achievements.Rewards.Experience:
        this.player.addExperience(this.data.reward);

        break;
    }

    this.setProgress(9999);
    this.update();

    this.player.send(
      new Messages.Quest(Packets.QuestOpcode.Finish, {
        id: this.id,
        name: this.name,
        isQuest: false,
      }),
    );

    if (npc && this.player.npcTalkCallback) this.player.npcTalkCallback(npc);
  }

  update() {
    this.player.save();
  }

  isThreshold() {
    return this.progress >= this.data.count;
  }

  hasItem() {
    if (
      this.data.type === Modules.Achievements.Type.Scavenge
      && this.player.inventory.contains(this.data.item)
    ) {
      this.player.inventory.remove(this.data.item, this.data.itemCount);

      return true;
    }

    return false;
  }

  setProgress(progress) {
    this.progress = progress;
  }

  isStarted() {
    return this.progress > 0;
  }

  isFinished() {
    return this.progress > 9998;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.data.type,
      description: this.description,
      count: this.data.count ? this.data.count : 1,
      progress: this.progress,
      finished: this.isFinished(),
    };
  }
}
