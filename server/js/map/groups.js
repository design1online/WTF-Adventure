import _ from 'underscore';
import map from '../../data/map/world_server.json' assert { type: 'json' };

export default class Groups {
  constructor(mapData) {
    this.map = mapData || map;

    this.width = this.map.width;
    this.height = this.map.height;

    this.zoneWidth = this.map.zoneWidth;
    this.zoneHeight = this.map.zoneHeight;

    this.groupWidth = this.map.groupWidth;
    this.groupHeight = this.map.groupHeight;

    this.linkedGroups = {};

    this.loadDoors();
  }

  loadDoors() {
    const {
      doors,
    } = map;

    _.each(doors, (door) => {
      const groupId = this.groupIdFromPosition(door.x, door.y);
      const linkedGroupId = this.groupIdFromPosition(door.tx, door.ty);
      const linkedGroupPosition = this.groupIdToPosition(linkedGroupId);

      if (groupId in this.linkedGroups) {
        this.linkedGroups[groupId].push(linkedGroupPosition);
      } else {
        this.linkedGroups[groupId] = [linkedGroupPosition];
      }
    });
  }

  getAdjacentGroups(id) {
    const position = this.groupIdToPosition(id);
    const {
      x,
      y,
    } = position;
    const list = [];

    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        list.push({
          x: x + j,
          y: y + i,
        });
      }
    }

    _.each(this.linkedGroups[id], (groupPosition) => {
      if (!_.any(list, pos => pos.x === x && pos.y === y)) {
        list.push(groupPosition);
      }
    });

    return _.reject(list, (groupPosition) => {
      const gX = groupPosition.x;
      const gY = groupPosition.y;

      return (
        gX < 0 || gY < 0 || gX >= this.groupWidth || gY >= this.groupHeight
      );
    });
  }

  forEachGroup(callback) {
    for (let x = 0; x < this.groupWidth; x += 1) for (let y = 0; y < this.groupHeight; y += 1) callback(`${x}-${y}`);
  }

  forEachAdjacentGroup(groupId, callback) {
    if (!groupId) return;

    _.each(this.getAdjacentGroups(groupId), (position) => {
      callback(`${position.x}-${position.y}`);
    });
  }

  groupIdFromPosition(x, y) {
    return (
      `${Math.floor(x / this.zoneWidth)}-${Math.floor(y / this.zoneHeight)}`
    );
  }

  groupIdToPosition(id) {
    const position = id.split('-');

    return {
      x: parseInt(position[0], 10),
      y: parseInt(position[1], 10),
    };
  }
}
