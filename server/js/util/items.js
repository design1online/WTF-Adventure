import log from './log.js';
import PluginLoader from './plugins.js';

const ItemsDictionary = {
  data: {},
  properties: {},
  plugins: {},
  onCreate: {},
  getProperty: key => ItemsDictionary.properties[key],
  setProperty: (key, value) => {
    ItemsDictionary.properties[key] = value;
  },
  setData: (key, value) => {
    ItemsDictionary.data[key] = value; // by key
  },
  idToString: (id) => {
    let string = null;
    Object.entries(ItemsDictionary.data).forEach(([key, item]) => {
      if (key && item.id === id) {
        string = key;
      }
    });

    return string;
  },
  idToName: (id) => {
    let value = null;
    Object.entries(ItemsDictionary.data).forEach(([key, item]) => {
      if (key && item.id === id) {
        value = item.name;
      }
    });

    return value;
  },
  stringToId: (name) => {
    if (name in ItemsDictionary.data) {
      return ItemsDictionary.data[name].id;
    }

    log.error(`${name} not found in the ItemsDictionary.`);
    return 'null';
  },
  exists: id => id in ItemsDictionary.data,
  setPlugins: (directory) => {
    ItemsDictionary.plugins = PluginLoader(directory);
  },
  getData: (name) => {
    if (name in ItemsDictionary.data) {
      return ItemsDictionary.data[name];
    }

    return 'null';
  },
  hasPlugin: (id) => {
    if (id in ItemsDictionary.data && ItemsDictionary.data[id].plugin in ItemsDictionary.plugins) {
      return true;
    }

    return false;
  },

  isNewPlugin: (id) => {
    if (id in ItemsDictionary.data && ItemsDictionary.data[id].plugin in ItemsDictionary.plugins) {
      return ItemsDictionary.plugins[ItemsDictionary.data[id].plugin];
    }

    return false;
  },

  getLevelRequirement: (name) => {
    let level = 1;
    const item = ItemsDictionary.data[name];

    if (item && item.requirement) {
      return item.requirement;
    }

    if (ItemsDictionary.isWeapon(name)) {
      level = ItemsDictionary.data[name].attack;
    } else if (ItemsDictionary.isArmour(name)) {
      level = ItemsDictionary.data[name].defense;
    } else if (ItemsDictionary.isPendant(name)) {
      level = ItemsDictionary.data[name].pendantLevel;
    } else if (ItemsDictionary.isRing(name)) {
      level = ItemsDictionary.data[name].ringLevel;
    } else if (ItemsDictionary.isBoots(name)) {
      level = ItemsDictionary.data[name].bootsLevel;
    }

    return level * 2;
  },

  getWeaponLevel: (weaponName) => {
    if (ItemsDictionary.isWeapon(weaponName)) {
      return ItemsDictionary.data[weaponName].attack;
    }

    return -1;
  },

  getArmourLevel: (armourName) => {
    if (ItemsDictionary.isArmour(armourName)) {
      return ItemsDictionary.data[armourName].defense;
    }

    return -1;
  },

  getPendantLevel: (pendantName) => {
    if (ItemsDictionary.isPendant(pendantName)) {
      return ItemsDictionary.data[pendantName].pendantLevel;
    }

    return -1;
  },

  getRingLevel: (ringName) => {
    if (ItemsDictionary.isRing(ringName)) {
      return ItemsDictionary.data[ringName].ringLevel;
    }

    return -1;
  },

  getBootsLevel: (bootsName) => {
    if (ItemsDictionary.isBoots(bootsName)) {
      return ItemsDictionary.data[bootsName].bootsLevel;
    }

    return -1;
  },

  isArcherWeapon: (string) => {
    if (string in ItemsDictionary.data) {
      return ItemsDictionary.data[string].type === 'weaponarcher';
    }

    return false;
  },

  isWeapon: (string) => {
    if (string in ItemsDictionary.data) {
      return (
        ItemsDictionary.data[string].type === 'weapon'
        || ItemsDictionary.data[string].type === 'weaponarcher'
      );
    }

    return false;
  },

  isArmour: (string) => {
    if (string in ItemsDictionary.data) {
      return (
        ItemsDictionary.data[string].type === 'armor'
        || ItemsDictionary.data[string].type === 'armorarcher'
      );
    }

    return false;
  },

  isPendant: (string) => {
    if (string in ItemsDictionary.data) {
      return ItemsDictionary.data[string].type === 'pendant';
    }

    return false;
  },

  isRing: (string) => {
    if (string in ItemsDictionary.data) {
      return ItemsDictionary.data[string].type === 'ring';
    }

    return false;
  },

  isBoots: (string) => {
    if (string in ItemsDictionary.data) {
      return ItemsDictionary.data[string].type === 'boots';
    }

    return false;
  },

  getType: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].type;
    }

    return null;
  },

  isStackable: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].stackable;
    }

    return false;
  },

  isEdible: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].edible;
    }

    return false;
  },

  getCustomData: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].customData;
    }

    return null;
  },

  maxStackSize: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].maxStackSize;
    }

    return false;
  },

  isShard: id => id === 253 || id === 254 || id === 255 || id === 256 || id === 257,

  isEnchantable: id => ItemsDictionary.getType(id) !== 'object' && ItemsDictionary.getType(id) !== 'craft',

  getShardTier: (id) => {
    switch (id) {
      case 253:
        return 1;
      case 254:
        return 2;
      case 255:
        return 3;
      case 256:
        return 4;
      case 257:
        return 5;
      default:
        return -1;
    }
  },

  isEquippable: string => (
    ItemsDictionary.isArmour(string)
      || ItemsDictionary.isWeapon(string)
      || ItemsDictionary.isPendant(string)
      || ItemsDictionary.isRing(string)
      || ItemsDictionary.isBoots(string)
  ),

  healsHealth: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].healsHealth > 0;
    }

    return false;
  },

  healsMana: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].healsMana > 0;
    }

    return false;
  },

  getHealingFactor: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].healsHealth;
    }

    return 0;
  },

  getManaFactor: (id) => {
    if (id in ItemsDictionary.data) {
      return ItemsDictionary.data[id].healsMana;
    }
    return 0;
  },
};

export default ItemsDictionary;
