import _ from 'underscore';
import Messages from '../../../../network/messages.js';
import Packets from '../../../../network/packets.js';
import Npcs from '../../../../util/npcs.js';

export default class PlayerHandler {
  constructor(player) {
    this.player = player;
    this.world = player.world;
    this.loadPlayerHandler();
  }

  loadPlayerHandler() {
    this.player.onMovement((x, y) => {
      this.player.checkGroups();
      this.detectAggro();
      this.detectPVP(x, y);
      this.detectMusic(x, y);
    });

    this.player.onDeath(() => {});
    this.player.onHit((attacker) => {
      /**
       * Handles actions whenever the player
       * instance is hit by 'damage' amount
       */

      if (this.player.combat.isRetaliating()) {
        this.player.combat.begin(attacker);
      }
    });

    this.player.onKill((character) => {
      if (this.player.quests.isAchievementMob(character)) {
        const achievement = this.player.quests.getAchievementByMob(character);

        if (achievement && achievement.isStarted()) {
          this.player.quests.getAchievementByMob(character).step();
        }
      }
    });

    this.player.onGroup(() => {
      this.world.handleEntityGroup(this.player);
      this.world.pushEntities(this.player);
    });

    this.player.connection.onClose(() => {
      this.player.stopHealing();

      this.world.removePlayer(this.player);
    });

    this.player.onTalkToNPC((npc) => {
      console.log('talk to NPC', npc);
      if (this.player.quests.isQuestNPC(npc)) {
        console.log('this is a quest npc');
        this.player.quests.getQuestByNPC(npc).triggerTalk(npc);
        return;
      }

      if (this.player.quests.isAchievementNPC(npc)) {
        console.log('this is an achievement npc');
        this.player.quests.getAchievementByNPC(npc).converse(npc);
        return;
      }

      switch (Npcs.getType(npc.id)) {
        default:
          break;
        case 'banker':
          console.log('this is a banker');
          this.player.send(new Messages.NPC(Packets.NPCOpcode.Bank, {}));
          return;
        case 'echanter':
          console.log('this is an enchanter');
          this.player.send(new Messages.NPC(Packets.NPCOpcode.Enchant, {}));
          break;
      }

      const text = Npcs.getText(npc.id);
      console.log('this is a regular npc with this text', text);

      if (!text) {
        console.log('ERROR: this NPC has no next', npc);
        return;
      }

      npc.talk(text);

      console.log('sending NPC talk data', npc.instance, text);
      this.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text,
        }),
      );
    });
  }

  detectAggro() {
    const group = this.world.groups[this.player.group];

    if (!group) {
      return;
    }

    _.each(group.entities, (entity) => {
      if (entity && entity.type === 'mob') {
        const aggro = entity.canAggro(this.player);

        if (aggro) {
          entity.combat.begin(this.player);
        }
      }
    });
  }

  detectMusic(x, y) {
    const musicArea = _.find(this.world.getMusicAreas(), area => area.contains(x, y));
    if (musicArea && this.player.currentSong !== musicArea.id) {
      this.player.updateMusic(musicArea.id);
    }
  }

  detectPVP(x, y) {
    const pvpArea = _.find(this.world.getPVPAreas(), area => area.contains(x, y));

    this.player.updatePVP(!!pvpArea);
  }
}
