import Quest from '../quest.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';

export default class BulkySituation extends Quest {
  constructor(player, data) {
    super(player, data);
    this.player = player;
    this.data = data;
    this.lastNPC = null;
  }

  load(stage) {
    if (!stage) {
      this.update();
    } else {
      this.stage = stage;
    }

    this.loadCallbacks();
  }

  loadCallbacks() {
    if (this.stage > 9999) {
      return;
    }

    this.onNPCTalk((npc) => {
      if (this.hasRequirement()) {
        this.progress('item');
        return;
      }

      const conversation = this.getConversation(npc.id);

      this.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: conversation,
        }),
      );

      this.lastNPC = npc;

      npc.talk(conversation);

      if (npc.talkIndex > conversation.length) {
        this.progress('talk');
      }
    });
  }

  progress(type) {
    const
      task = this.data.task[this.stage];

    if (!task || task !== type) {
      return;
    }

    if (this.stage === this.data.stages) {
      this.finish();
      return;
    }

    switch (type) {
      default:
        break;
      case 'item':
        this.player.inventory.remove(this.getItem(), 1);
        break;
    }

    this.resetTalkIndex(this.lastNPC);

    this.stage += 1;

    this.player.send(
      new Messages.Quest(Packets.QuestOpcode.Progress, {
        id: this.id,
        stage: this.stage,
        isQuest: true,
      }),
    );
  }

  hasRequirement() {
    return (
      this.getTask() === 'item'
      && this.player.inventory.contains(this.getItem())
    );
  }
}
