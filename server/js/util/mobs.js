import log from './log.js';
import PluginLoader from './plugins.js';

const MobsDictionary = {
  data: {},
  properties: {},
  plugins: {},
  getProperty: key => MobsDictionary.properties[key],
  setProperty: (key, value) => {
    MobsDictionary.properties[key] = value;
  },
  getData: key => MobsDictionary.data[key],
  setData: (key, value) => {
    MobsDictionary.data[key] = value; // by key
  },
  idToString: (id) => {
    let string = null;
    Object.entries(MobsDictionary.data).forEach(([key, mob]) => {
      if (key && mob.id === id) {
        string = key;
      }
    });

    return string;
  },
  idToName: (id) => {
    let value = null;
    Object.entries(MobsDictionary.data).forEach(([key, mob]) => {
      if (key && mob.id === id) {
        value = mob.name;
      }
    });

    return value;
  },
  stringToId: (name) => {
    if (name in MobsDictionary.data) {
      return MobsDictionary.data[name].id;
    }

    log.error(`${name} not found in the MobsDictionary.`);
    return 'null';
  },
  exists: (id) => {
    let value = null;
    Object.entries(MobsDictionary.data).forEach(([key, mob]) => {
      if (key && mob.id === id) {
        value = mob;
      }
    });

    return value;
  },
  setPlugins: (directory) => {
    MobsDictionary.plugins = PluginLoader(directory);
  },
  getXp: (id) => {
    if (id in MobsDictionary.data) {
      return MobsDictionary.data[id].xp;
    }

    return -1;
  },
  hasCombatPlugin: id => id in MobsDictionary.data
    && MobsDictionary.data[id].combatPlugin in MobsDictionary.plugins,
  isNewCombatPlugin: (id) => {
    if (id in MobsDictionary.data
      && MobsDictionary.data[id].combatPlugin in MobsDictionary.plugins) {
      return MobsDictionary.plugins[MobsDictionary.data[id].combatPlugin];
    }
    return null;
  },
};

export default MobsDictionary;
