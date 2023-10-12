import log from './log.js';
import PluginLoader from './plugins.js';

const NpcsDictionary = {
  data: {},
  properties: {},
  plugins: {},
  getProperty: key => NpcsDictionary.properties[key],
  setProperty: (key, value) => {
    NpcsDictionary.properties[key] = value;
  },
  getData: key => NpcsDictionary.data[key],
  setData: (key, value) => {
    NpcsDictionary.data[key] = value; // by key
  },
  idToString: (id) => {
    let string = null;
    Object.entries(NpcsDictionary.data).forEach(([key, npc]) => {
      if (key && npc.id === id) {
        string = key;
      }
    });

    return string;
  },
  idToName: (id) => {
    let value = null;
    Object.entries(NpcsDictionary.data).forEach(([key, npc]) => {
      if (key && npc.id === id) {
        value = npc.name;
      }
    });

    return value;
  },
  stringToId: (name) => {
    if (name in NpcsDictionary.data) {
      return NpcsDictionary.data[name].id;
    }

    log.error(`${name} not found in the NpcsDictionary.`);
    return 'null';
  },
  exists: id => id in NpcsDictionary.data,
  setPlugins: (directory) => {
    NpcsDictionary.plugins = PluginLoader(directory);
  },
  getText: (id) => {
    if (NpcsDictionary.data && NpcsDictionary.data[id]) {
      return NpcsDictionary.data[id].text;
    }

    return null;
  },

  getType: (id) => {
    if (NpcsDictionary.data && NpcsDictionary.data[id]) {
      return NpcsDictionary.data[id].type;
    }

    return null;
  },
};

export default NpcsDictionary;
