import Minigame from '../minigame';
import Data from '../../../data/minigames.json' assert { type: 'json' };

export default class TeamWar extends Minigame {
  constructor(world) {
    super(Data.TeamWar.id, Data.TeamWar.name);
    this.world = world;
    this.data = Data.TeamWar;
  }
}
