import log from '../../../../util/log.js';
import Guilds from '../../../../../data/guilds.json' assert { type: 'json' };

export default class Guild {
  constructor(name, leader) {
    this.name = name;
    this.leader = leader;
    this.members = [];
    this.connected = false;
  }

  add(player) {
    this.members.push(player);
    this.save();
  }

  save() {
    log.notice(Guilds[this.leader.username]);
  }
}
