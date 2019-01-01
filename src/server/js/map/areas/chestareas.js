var cls = require("../../lib/class"),
  Area = require("../area"),
  map = require("../../../data/map/world_server.json"),
  _ = require("underscore");

module.exports = ChestAreas = cls.Class.extend({
  constructor(world) {
    

    this.world = world;

    this.chestAreas = [];

    this.load();
  },

  load() {
    

    _.each(map.chestAreas, function(m) {
      var chestArea = new Area(m.id, m.x, m.y, m.width, m.height);

      chestArea.maxEntities = m.entities;
      chestArea.items = m.i;
      chestArea.cX = m.tx;
      chestArea.cY = m.ty;

      this.chestAreas.push(chestArea);

      chestArea.onEmpty(function() {
        this.spawnChest(this);
      });

      chestArea.onSpawn(function() {
        this.removeChest(this);
      });
    });

    log.info("Loaded " + this.chestAreas.length + " chest areas.");
  },

  standardize() {
    

    _.each(this.chestAreas, function(chestArea) {
      chestArea.setMaxEntities(chestArea.entities.length);
    });
  },

  spawnChest(chestArea) {
    

    /**
     * Works beautifully :)
     */

    chestArea.chest = this.world.spawnChest(
      chestArea.items,
      chestArea.cX,
      chestArea.cY,
      false
    );
  },

  removeChest(chestArea) {
    

    if (!chestArea.chest) return;

    this.world.removeChest(chestArea.chest);

    chestArea.chest = null;
  }
});
