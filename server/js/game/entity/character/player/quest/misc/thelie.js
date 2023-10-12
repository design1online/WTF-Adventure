import Quest from '../quest';

export default class TheLie extends Quest {
  constructor(player, data) {
    super(data.id, data.name, data.description);
    this.player = player;
    this.data = data;
  }

  load(stage) {
    if (stage) {
      this.update();
    } else {
      this.stage = stage;
    }
  }

  update() {
    this.player.save();
  }
}
