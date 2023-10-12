import fs from 'fs';
import _ from 'underscore';
import log from '../util/log.js';
import Modules from '../util/modules.js';
import Utils from '../util/utils.js';
import Groups from './groups.js';
import PVPAreas from './areas/pvpareas.js';
import MusicAreas from './areas/musicareas.js';
import ChestAreas from './areas/chestareas.js';
import Grids from './grids.js';
import utils from '../util/utils.js';

import gridData from '../../data/map/collisions.json' assert { type: 'json' };
import map from '../../data/map/world_server.json' assert { type: 'json' };
import config from '../../config.json' assert { type: 'json' };

const __dirname = utils.dirName(import.meta.url);

export default class Map {
  constructor(world) {
    this.world = world;
    this.ready = false;
    this.loadServerMap();
    this.groups = new Groups(this);
    this.grids = new Grids(this);
  }

  loadServerMap() {
    this.width = map.width;
    this.height = map.height;
    this.collisions = map.collisions;
    this.bossAreas = map.bossAreas;
    this.roamingAreas = map.roamingAreas;
    this.chestAreas = map.chestAreas;
    this.chests = map.chests;
    this.staticEntities = map.staticEntities;

    this.zoneWidth = 30;
    this.zoneHeight = 15;

    this.groupWidth = Math.floor(this.width / this.zoneWidth);
    this.groupHeight = Math.floor(this.height / this.zoneHeight);

    this.areas = {};

    this.loadAreas();
    this.loadCollisions();
    this.loadDoors();

    this.ready = true;
  }

  /**
   * The structure for the new this.areas is as follows:
   *
   * this.areas = {
   *      pvpAreas = {
   *          allPvpAreas
   *      }
   *
   *      musicAreas = {
   *          allMusicAreas
   *      }
   *
   *      ...
   * }
   */
  loadAreas() {
    this.areas.PVP = new PVPAreas();
    this.areas.Music = new MusicAreas();
    this.areas.Chests = new ChestAreas(this.world);
  }

  loadDoors() {
    this.doors = {};

    _.each(map.doors, (door) => {
      let orientation;

      switch (door.to) {
        default:
          break;
        case 'u':
          orientation = Modules.Orientation.Up;
          break;

        case 'd':
          orientation = Modules.Orientation.Down;
          break;

        case 'l':
          orientation = Modules.Orientation.Left;
          break;

        case 'r':
          orientation = Modules.Orientation.Right;
          break;
      }

      this.doors[this.gridPositionToIndex(door.x, door.y)] = {
        x: door.tx,
        y: door.ty,
        orientation,
        portal: door.p === 1,
        level: door.l,
        achievement: door.a,
        rank: door.r,
      };
    });
  }

  isDoor(x, y) {
    return !!this.doors[this.gridPositionToIndex(x, y)];
  }

  getDoorDestination(x, y) {
    return this.doors[this.gridPositionToIndex(x, y)];
  }

  loadCollisions() {
    const location = `${__dirname}/../../data/map/collisions.json`;

    this.grid = null;

    fs.exists(location, (exists) => {
      if (!exists || config.forceCollisions) {
        log.notice('Generating the collision grid...');

        this.grid = [];

        let tileIndex = 0;

        for (let i = 0; i < this.height; i += 1) {
          this.grid[i] = [];
          for (let j = 0; j < this.width; j += 1) {
            if (_.include(this.collisions, tileIndex)) {
              this.grid[i][j] = 1;
            } else {
              this.grid[i][j] = 0;
            }

            tileIndex += 1;
          }
        }

        fs.writeFile(location, JSON.stringify(this.grid), (err) => {
          if (err) {
            log.notice(`An error has occurred: ${err}`);
            return;
          }

          log.notice('The collision grid has been successfully generated!');

          this.done();
        });
      } else {
        this.grid = gridData;
        this.done();
      }
    });
  }

  isValidPosition(x, y) {
    return (
      Utils.isInt(x)
      && Utils.isInt(y)
      && !this.isOutOfBounds(x, y)
      && !this.isColliding(x, y)
    );
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  isColliding(x, y) {
    if (this.isOutOfBounds(x, y)) {
      return false;
    }

    return this.grid[y][x] === 1;
  }

  indexToGridPosition(tileIndex) {
    tileIndex -= 1; // eslint-disable-line

    const x = this.getX(tileIndex + 1, this.width);
    const y = Math.floor(tileIndex / this.width);

    return {
      x,
      y,
    };
  }

  gridPositionToIndex(x, y) {
    return y * this.width + x + 1;
  }

  getX(index, width) {
    if (index === 0) {
      return 0;
    }

    return index % width === 0 ? width - 1 : (index % width) - 1;
  }

  getRandomPosition(area) {
    const pos = {};
    let valid = false;

    while (!valid) {
      pos.x = area.x + Utils.randomInt(0, area.width + 1);
      pos.y = area.y + Utils.randomInt(0, area.height + 1);
      valid = this.isValidPosition(pos.x, pos.y);
    }

    return pos;
  }

  inArea(posX, posY, x, y, width, height) {
    return posX >= x && posY >= y && posX <= width + x && posY <= height + y;
  }

  inTutorialArea(entity) {
    if (entity.x === -1 || entity.y === -1) return true;

    return (
      this.inArea(entity.x, entity.y, 13, 553, 7, 7)
      || this.inArea(entity.x, entity.y, 15, 13, 11, 12)
    );
  }

  done() {
    if (this.readyCallback) this.readyCallback();
  }

  isReady(callback) {
    this.readyCallback = callback;
  }
}
