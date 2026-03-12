import $ from 'jquery';
import _ from 'underscore';
import GamePage from './gamePage';

/**
 * Manages the quest and achievement tracking profile page
 * @class
 */
export default class Quest extends GamePage {
  /**
   * Default constructor
   */
  constructor() {
    super('#questPage');

    /**
     * The achievements list container element
     * @type {jQuery}
     */
    this.achievements = $('#achievementList');
    /**
     * The quests list container element
     * @type {jQuery}
     */
    this.quests = $('#questList');

    /**
     * The achievements completion count display element
     * @type {jQuery}
     */
    this.achievementsCount = $('#achievementCount');
    /**
     * The quests completion count display element
     * @type {jQuery}
     */
    this.questCount = $('#questCount');

    /**
     * The unordered list element within the achievements container
     * @type {jQuery}
     */
    this.achievementsList = this.achievements.find('ul');
    /**
     * The unordered list element within the quests container
     * @type {jQuery}
     */
    this.questList = this.quests.find('ul');
  }

  /**
   * Populates the quest and achievement lists from server data
   * @param {Array} quests array of quest data objects
   * @param {Array} achievements array of achievement data objects
   */
  loadQuest(quests, achievements) {
    let finishedAchievements = 0;
    let finishedQuests = 0;

    _.each(achievements, (achievement) => {
      const item = this.getItem(false, achievement.id);
      const name = this.getName(false, achievement.id);

      name.text('????????');
      name.css('background', 'rgba(255, 10, 10, 0.3)');

      if (achievement.progress > 0 && achievement.progress < 9999) {
        name.css('background', 'rgba(255, 255, 10, 0.4)');

        name.text(
          achievement.name
          + (achievement.count > 2
            ? ` ${
              achievement.progress - 1
            }/${
              achievement.count - 1}`
            : ''),
        );
      } else if (achievement.progress > 9998) {
        name.text(achievement.name);
        name.css('background', 'rgba(10, 255, 10, 0.3)');
      }

      if (achievement.finished) {
        finishedAchievements += 1;
      }

      item.append(name);

      const listItem = $('<li></li>');

      listItem.append(item);

      this.achievementsList.append(listItem);
    });

    _.each(quests, (quest) => {
      const item = this.getItem(true, quest.id);
      const name = this.getName(true, quest.id);

      name.text(quest.name);
      name.css('background', 'rgba(255, 10, 10, 0.3)');

      if (quest.stage > 0 && quest.stage < 9999) {
        name.css('background', 'rgba(255, 255, 10, 0.4)');
      } else if (quest.stage > 9998) {
        name.css('background', 'rgba(10, 255, 10, 0.3)');
      }

      if (quest.finished) {
        finishedQuests += 1;
      }

      item.append(name);

      const listItem = $('<li></li>');

      listItem.append(item);

      this.questList.append(listItem);
    });

    this.achievementsCount.html(
      `${finishedAchievements}/${achievements.length}`,
    );
    this.questCount.html(`${finishedQuests}/${quests.length}`);
  }

  /**
   * Updates the progress display for a quest or achievement
   * @param {Object} info progress info object with isQuest, id, name, count, and progress fields
   */
  progress(info) {
    const item = info.isQuest
      ? this.getQuest(info.id)
      : this.getAchievement(info.id);

    if (!item) return;

    const name = item.find(
      `${info.isQuest ? '#quest' : '#achievement'}${info.id}name`,
    );

    if (!name) return;

    if (!info.isQuest && info.count > 2) name.text(`${info.name} ${info.progress}/${info.count - 1}`);

    name.css('background', 'rgba(255, 255, 10, 0.4)');
  }

  /**
   * Updates the display when a quest or achievement is completed
   * @param {Object} info finish info object with isQuest, id, and name fields
   */
  finish(info) {
    const item = info.isQuest
      ? this.getQuest(info.id)
      : this.getAchievement(info.id);

    if (!item) return;

    const name = item.find(
      `${info.isQuest ? '#quest' : '#achievement'}${info.id}name`,
    );

    if (!name) return;

    if (!info.isQuest) name.text(info.name);

    name.css('background', 'rgba(10, 255, 10, 0.3)');
  }

  /**
   * Returns the quest list item element for the given quest id
   * @param {Number} id the quest identifier
   * @return {jQuery}
   */
  getQuest(id) {
    return $(this.questList.find('li')[id]).find(`#quest${id}`);
  }

  /**
   * Returns the achievement list item element for the given achievement id
   * @param {Number} id the achievement identifier
   * @return {jQuery}
   */
  getAchievement(id) {
    return $(this.achievementsList.find('li')[id]).find(`#achievement${id}`);
  }

  /**
   * Might as well properly organize them based
   * on their type of item and id (index).
   */

  /**
   * Creates and returns a new quest or achievement container element
   * @param {Boolean} isQuest true for a quest item, false for an achievement item
   * @param {Number} id the quest or achievement identifier
   * @return {jQuery}
   */
  getItem(isQuest, id) {
    return $(
      `<div id="${isQuest ? 'quest' : 'achievement'}${id}" class="questItem"></div>`,
    );
  }

  /**
   * Creates and returns a new quest or achievement name label element
   * @param {Boolean} isQuest true for a quest name, false for an achievement name
   * @param {Number} id the quest or achievement identifier
   * @return {jQuery}
   */
  getName(isQuest, id) {
    return $(
      `<div id="${isQuest ? 'quest' : 'achievement'}${id}name" class="questName"></div>`,
    );
  }
}
