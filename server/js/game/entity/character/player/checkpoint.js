export default class Checkpoint {
  constructor(id, player) {
    this.id = id;
    this.player = player;
    this.world = player.world;
    this.map = this.world.map;
  }
}
