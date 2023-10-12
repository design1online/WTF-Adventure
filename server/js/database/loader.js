import log from '../util/log.js';

export default class Loader {
  constructor(mysql) {
    this.mysql = mysql;
  }

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
