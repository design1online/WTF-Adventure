import _ from 'underscore';
import log from '../../util/log.js';
import Area from '../area.js';
import map from '../../../data/map/world_server.json' assert { type: 'json' };

export default class PVPAreas {
  constructor() {
    this.pvpAreas = [];
    this.loadPvpArea();
  }

  loadPvpArea() {
    const
      list = map.pvpAreas;

    _.each(list, (p) => {
      const pvpArea = new Area(p.id, p.x, p.y, p.width, p.height);

      this.pvpAreas.push(pvpArea);
    });

    log.notice(`Loaded ${this.pvpAreas.length} PVP areas.`);
  }
}
