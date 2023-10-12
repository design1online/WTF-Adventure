import _ from 'underscore';
import log from '../../util/log.js';
import map from '../../../data/map/world_server.json' assert { type: 'json' };
import Area from '../area.js';

export default class MusicAreas {
  constructor() {
    this.musicAreas = [];
    this.loadMusicArea();
  }

  loadMusicArea() {
    _.each(map.musicAreas, (m) => {
      const musicArea = new Area(m.id, m.x, m.y, m.width, m.height);

      this.musicAreas.push(musicArea);
    });

    log.notice(`Loaded ${this.musicAreas.length} music areas.`);
  }
}
