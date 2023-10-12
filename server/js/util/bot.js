import Player from '../game/entity/character/player/player.js';
import Creator from '../database/creator.js';

export default class Bot {
  constructor(world, count) {
    this.world = world;
    this.count = count;

    this.creator = new Creator(null);

    this.players = [];

    this.loadBot();
  }

  loadBot() {
    for (let i = 0; i < this.count; i += 1) {
      const connection = {
        id: i,
        listen: {},
        onClose: {},
      };
      const player = new Player(this.world, this.world.database, connection, -1);

      this.world.addPlayer(player);

      player.username = `Bot${i}`;

      player.loadPlayer(this.creator.getPlayerData(player));

      player.intro();

      player.walkRandomly();

      this.players.push(player);
    }
  }
}
