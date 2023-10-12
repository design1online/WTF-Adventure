import Quest from '../quest.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';

export default class Introduction extends Quest {
  constructor(player, data) {
    super(player, data);
    this.player = player;
    this.data = data;
    this.lastNPC = null;
  }

  load(stage) {
    if (!this.player.inTutorial()) {
      this.setStage(9999);
      this.update();
      return;
    }

    if (!stage) {
      this.update();
    } else {
      this.stage = stage;
    }

    this.loadCallbacks();
  }

  loadCallbacks() {
    if (this.stage >= 9999) return;

    this.updatePointers();
    this.toggleChat();

    this.onNPCTalk((npc) => {
      const conversation = this.getConversation(npc.id);

      this.lastNPC = npc;

      npc.talk(conversation);

      this.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: conversation,
        }),
      );

      if (npc.talkIndex > conversation.length) this.progress('talk');
    });

    this.player.onReady(() => {
      this.updatePointers();
    });

    this.player.onDoor((destX, destY) => {
      if (this.getTask() !== 'door') {
        this.player.notify('You cannot go through this door yet.');
        return;
      }

      if (!this.verifyDoor(this.player.x, this.player.y)) this.player.notify('You are not supposed to go through here.');
      else {
        this.progress('door');
        this.player.teleport(destX, destY, false);
      }
    });

    this.player.onProfile((isOpen) => {
      if (isOpen) {
        this.progress('click');
      }
    });
  }

  progress(type) {
    const
      task = this.data.task[this.stage];

    if (!task || task !== type) return;

    if (this.stage === this.data.stages) {
      this.finish();
      return;
    }

    switch (type) {
      default:
        break;
      case 'talk':
        if (this.stage === 4) {
          this.player.inventory.add({
            id: 248,
            count: 1,
            ability: -1,
            abilityLevel: -1,
          });
        }

        break;
    }

    this.stage += 1;
    this.clearPointers();
    this.resetTalkIndex(this.lastNPC);

    this.update();
    this.updatePointers();

    this.player.send(
      new Messages.Quest(Packets.QuestOpcode.Progress, {
        id: this.id,
        stage: this.stage,
        isQuest: true,
      }),
    );
  }

  isFinished() {
    return super.isFinished() || !this.player.inTutorial();
  }

  toggleChat() {
    this.player.canTalk = !this.player.canTalk;
  }

  setStage(stage) {
    super.setStage(stage);
    this.clearPointers();
  }

  finish() {
    this.toggleChat();
    super.finish();
  }

  verifyDoor(destX, destY) {
    const doorData = this.data.doors[this.stage];

    if (!doorData) {
      return false;
    }

    return doorData[0] === destX && doorData[1] === destY;
  }

  onFinishedLoading(callback) {
    this.finishedCallback = callback;
  }
}
