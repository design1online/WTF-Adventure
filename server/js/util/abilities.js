import log from './log.js';
import PluginLoader from './plugins.js';

const AbilityDictionary = {
  data: {},
  properties: {},
  plugins: {},
  getProperty: key => AbilityDictionary.properties[key],
  setProperty: (key, value) => {
    AbilityDictionary.properties[key] = value; // by key
  },
  getData: key => AbilityDictionary.data[key],
  setData: (key, value) => {
    AbilityDictionary.data[key] = value;
  },
  idToString: (id) => {
    let string = null;
    Object.entries(AbilityDictionary.data).forEach(([key, ability]) => {
      if (key && ability.id === id) {
        string = key;
      }
    });

    return string;
  },
  idToName: (id) => {
    let value = null;
    Object.entries(AbilityDictionary.data).forEach(([key, ability]) => {
      if (key && ability.id === id) {
        value = ability.name;
      }
    });

    return value;
  },
  stringToId: (name) => {
    if (name in AbilityDictionary.data) {
      return AbilityDictionary.data[name].id;
    }

    log.error(`${name} not found in the dictionary.`);
    return 'null';
  },
  exists: id => id in AbilityDictionary.data,
  setPlugins: (directory) => {
    AbilityDictionary.plugins = PluginLoader(directory);
  },
};

export default AbilityDictionary;
