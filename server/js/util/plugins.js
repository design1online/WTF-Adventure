import fs from 'fs';
import path from 'path';

/**
 * Regular expression to match JavaScript files that do not start with a dot
 * @type {RegExp}
 */
const Filter = /^([^\.].*)\.js$/;

/**
 * Loads all JavaScript plugin files from the specified directory and returns a map of module paths
 * @param {String} directory the directory path to scan for plugin files
 * @return {Object}
 */
export default function requireItems(directory) {
  const files = fs.readdirSync(directory);
  const modules = {};

  files.forEach((file) => {
    const match = file.match(Filter);

    if (match) {
      modules[match[1]] = path.resolve(directory + file);
    }
  });

  return modules;
}
