import TeamWar from '../minigames/impl/teamwar';

export default class  Minigames {
  constructor(world) {
    this.world = world;
    this.minigames = {};

    this.load();
  }

  load() {
    this.minigames.TeamWar = new TeamWar();
  }

  getTeamWar() {
    return this.minigames.TeamWar;
  }
}
