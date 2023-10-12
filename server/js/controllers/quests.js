import _ from 'underscore';
import Introduction from '../game/entity/character/player/quest/misc/introduction.js';
import BulkySituation from '../game/entity/character/player/quest/misc/bulkysituation.js';
import QuestData from '../../data/quests.json' assert { type: 'json' };
import AchievementData from '../../data/achievements.json' assert { type: 'json' };
import Achievement from '../game/entity/character/player/achievement.js';

export default class Quests {
  constructor(player) {
    this.player = player;
    this.quests = {};
    this.achievements = {};

    this.load();
  }

  load() {
    let questCount = 0;

    _.each(QuestData, (quest) => {
      if (questCount === 0) this.quests[quest.id] = new Introduction(this.player, quest);
      else if (questCount === 1) this.quests[quest.id] = new BulkySituation(this.player, quest);

      questCount += 1;
    });

    _.each(AchievementData, (achievement) => {
      this.achievements[achievement.id] = new Achievement(
        achievement.id,
        this.player,
      );
    });
  }

  updateQuests(ids, stages) {
    for (let id = 0; id < ids.length; id += 1) {
      if (parseInt(ids[id], 10) && this.quests[id]) {
        this.quests[id].load(stages[id]);
      }
    }
  }

  updateAchievements(ids, progress) {
    for (let id = 0; id < ids.length; id += 1) {
      if (parseInt(ids[id], 10) && this.achievements[id]) {
        this.achievements[id].setProgress(progress[id]);
      }
    }

    if (this.readyCallback) this.readyCallback();
  }

  getQuest(id) {
    if (id in this.quests) return this.quests[id];

    return null;
  }

  getQuests() {
    let ids = '';


    let stages = '';

    for (let id = 0; id < this.getQuestSize(); id += 1) {
      ids += `${id} `;
      stages += `${this.quests[id].stage} `;
    }

    return {
      username: this.player.username,
      ids,
      stages,
    };
  }

  getAchievements() {
    let ids = '';
    let progress = '';

    for (let id = 0; id < this.getAchievementSize(); id += 1) {
      ids += `${id} `;
      progress += `${this.achievements[id].progress} `;
    }

    return {
      username: this.player.username,
      ids,
      progress,
    };
  }

  getData() {
    const quests = [];


    const achievements = [];

    this.forEachQuest((quest) => {
      quests.push(quest.getInfo());
    });

    this.forEachAchievement((achievement) => {
      achievements.push(achievement.getInfo());
    });

    return {
      quests,
      achievements,
    };
  }

  forEachQuest(callback) {
    _.each(this.quests, (quest) => {
      callback(quest);
    });
  }

  forEachAchievement(callback) {
    _.each(this.achievements, (achievement) => {
      callback(achievement);
    });
  }

  getQuestsCompleted() {
    let count = 0;

    for (const id in this.quests) {
      if (this.quests.hasOwnProperty(id)) {
        if (this.quests[id].isFinished()) {
          count += 1;
        }
      }
    }

    return count;
  }

  getAchievementsCompleted() {
    let count = 0;

    for (const id in this.achievements) {
      if (this.achievements.hasOwnProperty(id)) {
        if (this.achievements[id].isFinished()) {
          count += 1;
        }
      }
    }

    return count;
  }

  getQuestSize() {
    return Object.keys(this.quests).length;
  }

  getAchievementSize() {
    return Object.keys(this.achievements).length;
  }

  getQuestByNPC(npc) {
    /**
     * Iterate through the quest list in the order it has been
     * added so that NPC's that are required by multiple quests
     * follow the proper order.
     */

    for (const id in this.quests) {
      if (this.quests.hasOwnProperty(id)) {
        const quest = this.quests[id];

        if (quest.hasNPC(npc.id)) return quest;
      }
    }

    return null;
  }

  getAchievementByNPC(npc) {
    for (const id in this.achievements) {
      if (this.achievements.hasOwnProperty(id) && this.achievements[id].data.npc === npc.id
        && !this.achievements[id].isFinished()
      ) return this.achievements[id];
    }

    return null;
  }

  getAchievementByMob(mob) {
    for (const id in this.achievements) {
      if (this.achievements.hasOwnProperty(id) && this.achievements[id].data.mob === mob.id) {
        return this.achievements[id];
      }
    }

    return null;
  }

  isQuestMob(mob) {
    for (const id in this.quests) {
      if (this.quests.hasOwnProperty(id)) {
        const quest = this.quests[id];

        if (!quest.isFinished() && quest.hasMob(mob.id)) {
          return true;
        }
      }
    }

    return false;
  }

  isAchievementMob(mob) {
    for (const id in this.achievements) {
      if (this.achievements.hasOwnProperty(id)) {
        if (
          this.achievements[id].data.mob === mob.id
          && !this.achievements[id].isFinished()
        ) return true;
      }
    }

    return false;
  }

  isQuestNPC(npc) {
    for (const id in this.quests) {
      if (this.quests.hasOwnProperty(id)) {
        const quest = this.quests[id];

        if (!quest.isFinished() && quest.hasNPC(npc.id)) {
          return true;
        }
      }
    }
    return false;
  }

  isAchievementNPC(npc) {
    for (const id in this.achievements) {
      if (this.achievements.hasOwnProperty(id)) {
        if (
          this.achievements[id].data.npc === npc.id
          && !this.achievements[id].isFinished()
        ) return true;
      }
    }

    return false;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
}
