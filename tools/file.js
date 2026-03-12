import semver from 'semver';
import fs from 'fs';
import path from 'path';

/**
 * Selects the appropriate module based on the Node.js version; uses fs for >=0.7.1, otherwise path
 * @type {Object}
 */
const module = semver.satisfies(process.version, '>=0.7.1')
  ? fs
  : path;

/**
 * File existence check functions extracted from the selected module
 * @type {Object}
 */
const { exists, existsSync } = module.exists;

if (!(typeof exports === 'undefined')) {
  module.exports.exists = exists;
  module.exports.existsSync = existsSync;
}
