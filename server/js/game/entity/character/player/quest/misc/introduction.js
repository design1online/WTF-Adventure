import Quest from '../quest.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';

/**
 * Represents the introductory tutorial quest for new players
 * @class
 */
export default class Introduction extends Quest {
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
    if (!this.player.inTutorial()) {
      this.setStage(9999);
      this.update();
      return;
    }

    if (!stage) {
      this.update();
    } else {
      /** @type {Number} */
      this.stage = stage;
    }

    this.loadCallbacks();
  }

  /**
   * Registers player event callbacks for tutorial quest progression
   */
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

  /**
   * Advances the quest stage based on the given action type
   * @param {String} type the type of action that triggered progress (e.g. 'talk', 'door', 'click')
   */
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

  /**
   * Returns whether the tutorial quest is finished
   * @return {Boolean}
   */
  isFinished() {
    return super.isFinished() || !this.player.inTutorial();
  }

  /**
   * Toggles the player's ability to chat
   */
  toggleChat() {
    this.player.canTalk = !this.player.canTalk;
  }

  /**
   * Sets the quest stage and clears any active pointers
   * @param {Number} stage the stage value to set
   */
  setStage(stage) {
    super.setStage(stage);
    this.clearPointers();
  }

  /**
   * Completes the tutorial quest and re-enables chat
   */
  finish() {
    this.toggleChat();
    super.finish();
  }

  /**
   * Checks whether the given coordinates match the door destination for the current stage
   * @param {Number} destX the x coordinate of the door destination
   * @param {Number} destY the y coordinate of the door destination
   * @return {Boolean}
   */
  verifyDoor(destX, destY) {
    const doorData = this.data.doors[this.stage];

    if (!doorData) {
      return false;
    }

    return doorData[0] === destX && doorData[1] === destY;
  }

  /**
   * Registers a callback to invoke when the quest finishes loading
   * @param {Function} callback the function to call when loading is complete
   */
  onFinishedLoading(callback) {
    /**
     * Callback invoked when the quest finishes loading
     * @type {Function}
     */
    this.finishedCallback = callback;
  }
}
