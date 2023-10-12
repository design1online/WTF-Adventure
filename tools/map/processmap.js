import _ from 'underscore';

/**
 * Global Values
 */
const collisions = {};
const entities = {};
let mobsFirstGid = -1;
let map;
let mode;

export default function parse(json, options) {
  this.json = json;
  this.options = options;

  mode = this.options.mode;

  map = {
    width: 0,
    height: 0,
    collisions: [],
  };

  switch (mode) {
    default: break;
    case 'client':
      map.data = [];
      map.high = [];
      map.blocking = [];
      map.animated = {};

      break;

    case 'server':
      map.roamingAreas = [];
      map.pvpAreas = [];
      map.gameAreas = [];
      map.doors = [];
      map.musicAreas = [];

      map.staticEntities = {};
      map.chestAreas = [];
      map.chests = [];

      break;
  }

  map.width = this.json.width;
  map.height = this.json.height;

  map.tilesize = this.json.tilewidth;

  const handleProperty = function (property, value, id) {
    if (property === 'c') collisions[id] = true;

    if (mode === 'client') {
      if (property === 'v') map.high.push(id);

      if (property === 'length') {
        if (!map.animated[id]) map.animated[id] = {};

        map.animated[id].l = value;
      }

      if (property === 'delay') {
        if (!map.animated[id]) map.animated[id] = {};

        map.animated[id].d = value;
      }
    }
  };

  if (this.json.tilesets instanceof Array) {
    _.each(this.json.tilesets, (tileset) => {
      const name = tileset.name.toLowerCase();

      if (name === 'tilesheet') {
        _.each(tileset.tileproperties, (value, name) => {
          const id = parseInt(name, 10) + 1;

          _.each(value, (value, name) => {
            handleProperty(
              name,
              isValid(parseInt(value, 10)) ? parseInt(value, 10) : value,
              id,
            );
          });
        });
      } else if (name === 'mobs' && mode === 'server') {
        mobsFirstGid = tileset.firstgid;

        _.each(tileset.tileproperties, (value, name) => {
          const id = parseInt(name, 10) + 1;

          entities[id] = value.type;
        });
      }
    });
  }

  _.each(this.json.layers, (layer) => {
    const name = layer.name.toLowerCase();


    const type = layer.type;

    if (mode === 'server') {
      switch (name) {
        case 'doors':
          var doors = layer.objects;

          for (var d = 0; d < doors.length; d += 1) {
            map.doors[d] = {
              x: doors[d].x / map.tilesize,
              y: doors[d].y / map.tilesize,
              p: doors[d].type === 'portal' ? 1 : 0,
            };

            _.each(doors[d].properties, (value, name) => {
              map.doors[d][`t${name}`] = isValid(parseInt(value, 10))
                ? parseInt(value, 10)
                : value;
            });
          }

          break;

        case 'roaming':
          var areas = layer.objects;

          for (let a = 0; a < areas.length; a++) {
            let count = 1;

            if (areas[a].properties) count = parseInt(areas[a].properties.count, 10);

            map.roamingAreas[a] = {
              id: a,
              x: areas[a].x / map.tilesize,
              y: areas[a].y / map.tilesize,
              width: areas[a].width / map.tilesize,
              height: areas[a].height / map.tilesize,
              type: areas[a].type,
              count,
            };
          }

          break;

        case 'chestareas':
          var cAreas = layer.objects;

          _.each(cAreas, (area) => {
            const chestArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize,
            };

            chestArea.i = _.map(area.properties.items.split(','), name => name);

            _.each(area.properties, (value, name) => {
              if (name !== 'items') {
                chestArea[`t${name}`] = isValid(parseInt(value, 10))
                  ? parseInt(value, 10)
                  : value;
              }
            });

            map.chestAreas.push(chestArea);
          });

          break;

        case 'chests':
          var chests = layer.objects;

          _.each(chests, (chest) => {
            const oChest = {
              x: chest.x / map.tilesize,
              y: chest.y / map.tilesize,
            };

            oChest.i = _.map(chest.properties.items.split(','), name => name);

            map.chests.push(oChest);
          });

          break;

        case 'music':
          var mAreas = layer.objects;

          _.each(mAreas, (area) => {
            const musicArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize,
              id: area.properties.id,
            };

            map.musicAreas.push(musicArea);
          });

          break;

        case 'pvp':
          var pAreas = layer.objects;

          _.each(pAreas, (area) => {
            const pvpArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize,
            };

            map.pvpAreas.push(pvpArea);
          });

          break;

        case 'games':
          var gAreas = layer.objects;

          _.each(gAreas, (area) => {
            const gameArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize,
            };

            map.gameAreas.push(gameArea);
          });

          break;
      }
    }
  });

  for (let l = this.json.layers.length - 1; l > 0; l -= 1) {
    parseLayer(this.json.layers[l]);
  }

  if (mode === 'client') {
    for (let i = 0, max = map.data.length; i < max; i++) {
      if (!map.data[i]) {
        map.data[i] = 0;
      }
    }
  }

  return map;
}

var isValid = function (number) {
  return (
    number
    && !isNaN(number - 0)
    && number !== null
    && number !== ''
    && number !== false
  );
};

var parseLayer = function (layer) {
  const name = layer.name.toLowerCase();
  const type = layer.type;

  if (name === 'entities' && mode === 'server') {
    var tiles = layer.data;

    for (let i = 0; i < tiles.length; i++) {
      const gid = tiles[i] - mobsFirstGid + 1;

      if (gid && gid > 0) {
        map.staticEntities[i] = entities[gid];
      }
    }
  }

  var tiles = layer.data;

  if (name === 'blocking' && mode === 'client') {
    for (let j = 0; j < tiles.length; j += 1) {
      const bGid = tiles[j];

      if (bGid && bGid > 0) {
        map.blocking.push(j);
      }
    }
  } else if (
    type === 'tilelayer'
    && layer.visible !== 0
    && name !== 'entities'
  ) {
    for (let k = 0; k < tiles.length; k += 1) {
      const tGid = tiles[k];

      if (mode === 'client') {
        if (tGid > 0) {
          if (map.data[k] === undefined) {
            map.data[k] = tGid;
          } else if (map.data[k] instanceof Array) {
            map.data[k].unshift(tGid);
          } else {
            map.data[k] = [tGid, map.data[k]];
          }
        }
      }

      if (tGid in collisions) {
        map.collisions.push(k);
      }
    }
  }
};
