import log from '../util/log.js';

/**
 * Loads player data from the database
 * @class
 */
export default class Loader {
  /**
   * Default constructor
   * @param {Object} mysql the MySQL connection wrapper
   */
  constructor(mysql) {
    /**
     * The MySQL connection wrapper
     * @type {Object}
     */
    this.mysql = mysql;
  }

  /**
   * Retrieves a player's inventory data from the database
   * @param {Player} player the player whose inventory to load
   * @param {Function} callback called with ids, counts, abilities, and abilityLevels arrays
   */
  getInventory(player, callback) {
    this.mysql.connection.query(
      'SELECT * FROM `player_inventory` WHERE `player_inventory`.`username`=?',
      [player.username],
      (error, rows) => {
        const info = rows.shift();

        if (info.username !== player.username) {
          log.notice(
            `Mismatch whilst retrieving inventory data for: ${player.username}`,
          );
        }

        callback(
          info.ids.split(' '),
          info.counts.split(' '),
          info.abilities.split(' '),
          info.abilityLevels.split(' '),
        );
      },
    );
  }

  /**
   * Retrieves a player's bank data from the database
   * @param {Player} player the player whose bank to load
   * @param {Function} callback called with ids, counts, abilities, and abilityLevels arrays
   */
  getBank(player, callback) {
    this.mysql.connection.query(
      'SELECT * FROM `player_bank` WHERE `player_bank`.`username`=?',
      [player.username],
      (error, rows) => {
        const info = rows.shift();

        if (info.username !== player.username) {
          log.notice(
            `Mismatch whilst retrieving bank data for: ${player.username}`,
          );
        }

        callback(
          info.ids.split(' '),
          info.counts.split(' '),
          info.abilities.split(' '),
          info.abilityLevels.split(' '),
        );
      },
    );
  }

  /**
   * Retrieves a player's quest progress data from the database
   * @param {Player} player the player whose quests to load
   * @param {Function} callback called with ids and stages arrays
   */
  getQuests(player, callback) {
    this.mysql.connection.query(
      'SELECT * FROM `player_quests` WHERE `player_quests`.`username`=?',
      [player.username],
      (error, rows) => {
        const info = rows.shift();

        if (info.username !== player.username) {
          log.notice(
            `Mismatch whilst retrieving quest data for: ${player.username}`,
          );
        }

        callback(info.ids.split(' '), info.stages.split(' '));
      },
    );
  }

  /**
   * Retrieves a player's achievement progress data from the database
   * @param {Player} player the player whose achievements to load
   * @param {Function} callback called with ids and progress arrays
   */
  getAchievements(player, callback) {
    this.mysql.connection.query(
      'SELECT * FROM `player_achievements` WHERE `player_achievements`.`username`=?',
      [player.username],
      (error, rows) => {
        const info = rows.shift();

        if (info.username !== player.username) {
          log.notice(
            `Mismatch whilst retreiving achievement data for: ${
              player.username}`,
          );
        }

        callback(info.ids.split(' '), info.progress.split(' '));
      },
    );
  }
}
