import Messages from '../../../../../network/messages.js';
import Packets from '../../../../../network/packets.js';
import Utils from '../../../../../util/utils.js';

/**
 * Base class representing a player quest
 * @class
 */
export default class Quest {
  /**
   * Default constructor
   * @param {Player} player the player undertaking this quest
   * @param {Object} data the quest data object
   * @param {String} description an optional description override
   */
  constructor(player, data, description) {
    /**
     * The player undertaking this quest
     * @type {Player}
     */
    this.player = player;
    /**
     * The quest data object
     * @type {Object}
     */
    this.data = data;
    /**
     * The unique identifier of this quest
     * @type {Number}
     */
    this.id = data.id;
    /**
     * The display name of this quest
     * @type {String}
     */
    this.name = data.name;
    /**
     * The description of this quest
     * @type {String}
     */
    this.description = description || data.description;
    /**
     * The current stage of this quest
     * @type {Number}
     */
    this.stage = 0;
  }

  /**
   * Completes the quest, distributing item rewards and notifying the client
   */
  finish() {
    if (this.hasItemReward()) {
      const item = this.getItemReward();

      if (item) {
        if (this.hasInventorySpace(item.id, item.count)) {
          this.player.inventory.add(item.id, item.count);
        } else {
          this.player.notify('You do not have enough space in your inventory.');
          this.player.notify('Please make room prior to finishing the quest.');

          return;
        }
      }
    }

    this.setStage(9999);

    this.player.send(
      new Messages.Quest(Packets.QuestOpcode.Finish, {
        id: this.id,
        isQuest: true,
      }),
    );
  }

  /**
   * Returns whether the quest is finished
   * @return {Boolean}
   */
  isFinished() {
    return this.stage >= 9999;
  }

  /**
   * Sets the current quest stage and saves progress
   * @param {Number} stage the stage number to set
   */
  setStage(stage) {
    this.stage = stage;
    this.update();
  }

  /**
   * Returns whether the quest involves a mob objective
   * @return {Boolean}
   */
  hasMob() {
    return false;
  }

  /**
   * Triggers the NPC talk callback with the given NPC
   * @param {NPC} npc the NPC to pass to the callback
   */
  triggerTalk(npc) {
    if (this.npcTalkCallback) this.npcTalkCallback(npc);
  }

  /**
   * Registers a callback to invoke when the player talks to an NPC
   * @param {Function} callback the function to call on NPC talk
   */
  onNPCTalk(callback) {
    /**
     * Callback invoked when the player talks to an NPC
     * @type {Function}
     */
    this.npcTalkCallback = callback;
  }

  /**
   * Checks whether the given NPC ID is part of this quest
   * @param {Number} id the NPC ID to check
   * @return {Boolean}
   */
  hasNPC(id) {
    return this.data.npcs.indexOf(id) > -1;
  }

  /**
   * Persists the current quest state by saving the player
   */
  update() {
    this.player.save();
  }

  /**
   * Sends a pointer update to the client for the current quest stage
   */
  updatePointers() {
    if (!this.data.pointers) return;

    const pointer = this.data.pointers[this.stage];

    if (!pointer) return;

    const opcode = pointer[0];


    const x = pointer[1];


    const y = pointer[2];

    this.player.send(
      new Messages.Pointer(opcode, {
        id: Utils.generateRandomId(),
        x,
        y,
      }),
    );
  }

  /**
   * Forces an NPC to display a specific message to the player
   * @param {NPC} npc the NPC to speak
   * @param {String} message the message text to display
   */
  forceTalk(npc, message) {
    if (!npc) {
      return;
    }

    npc.talkIndex = 0; // eslint-disable-line

    this.player.send(
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: npc.instance,
        text: message,
      }),
    );
  }

  /**
   * Ensures that an NPC does not go off the conversation
   * index and is resetted in order to start a new chat
   */
  resetTalkIndex(npc) {
    if (!npc) {
      return;
    }

    npc.talkIndex = 0; // eslint-disable-line

    this.player.send(
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: npc.instance,
        text: null,
      }),
    );
  }

  /**
   * Sends a message to remove all active pointers from the client
   */
  clearPointers() {
    this.player.send(new Messages.Pointer(Packets.PointerOpcode.Remove, {}));
  }

  /**
   * Returns the conversation array for the given NPC ID at the current stage
   * @param {Number} id the NPC ID to retrieve conversation for
   * @return {Array}
   */
  getConversation(id) {
    const
      conversation = this.data.conversations[id];

    if (!conversation || !conversation[this.stage]) return [''];

    return conversation[this.stage];
  }

  /**
   * Returns whether this quest has an item reward
   * @return {Boolean}
   */
  hasItemReward() {
    return !!this.data.itemReward;
  }

  /**
   * Returns the task type for the current stage
   * @return {String}
   */
  getTask() {
    return this.data.task[this.stage];
  }

  /**
   * Returns the unique quest ID
   * @return {Number}
   */
  getId() {
    return this.id;
  }

  /**
   * Returns the quest display name
   * @return {String}
   */
  getName() {
    return this.name;
  }

  /**
   * Returns the quest description
   * @return {String}
   */
  getDescription() {
    return this.description;
  }

  /**
   * Returns the current quest stage
   * @return {Number}
   */
  getStage() {
    return this.stage;
  }

  /**
   * Returns the required item ID for the current stage, if any
   * @return {Number}
   */
  getItem() {
    return this.data.itemReq ? this.data.itemReq[this.stage] : null;
  }

  /**
   * Returns the item reward for this quest, if any
   * @return {Object}
   */
  getItemReward() {
    return this.hasItemReward() ? this.data.itemReward : null;
  }

  /**
   * Checks whether the player's inventory can hold the given item
   * @param {Number} id the item ID to check
   * @param {Number} count the item count to check
   * @return {Boolean}
   */
  hasInventorySpace(id, count) {
    return this.player.inventory.canHold(id, count);
  }

  /**
   * Returns a plain object describing the current quest state
   * @return {Object}
   */
  getInfo() {
    return {
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      stage: this.getStage(),
      finished: this.isFinished(),
    };
  }
}
