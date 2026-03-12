import Quest from '../quest.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';

/**
 * Represents the "Bulky Situation" quest implementation
 * @class
 */
export default class BulkySituation extends Quest {
  /**
   * Default constructor
   * @param {Player} player the player undertaking this quest
   * @param {Object} data the quest data object with stages and tasks
   */
  constructor(player, data) {
    super(player, data);
    /**
     * The player undertaking this quest
     * @type {Player}
     */
    this.player = player;
    /**
     * The quest data object containing stages and task definitions
     * @type {Object}
     */
    this.data = data;
    /**
     * The last NPC the player interacted with in this quest
     * @type {NPC}
     */
    this.lastNPC = null;
  }

  /**
   * Loads the quest at the given stage and sets up event callbacks
   * @param {Number} stage the stage to load the quest at
   */
  load(stage) {
    if (!stage) {
      this.update();
    } else {
      /** @type {Number} */
      this.stage = stage;
    }

    this.loadCallbacks();
  }

  /**
   * Registers NPC talk callbacks for quest progression
   */
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

  /**
   * Advances the quest stage based on the given action type
   * @param {String} type the type of action that triggered progress (e.g. 'talk', 'item')
   */
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

  /**
   * Checks whether the player has the required item for the current stage
   * @return {Boolean}
   */
  hasRequirement() {
    return (
      this.getTask() === 'item'
      && this.player.inventory.contains(this.getItem())
    );
  }
}
