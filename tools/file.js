import semver from 'semver';
import fs from 'fs';
import path from 'path';

const module = semver.satisfies(process.version, '>=0.7.1')
  ? fs
  : path;

const { exists, existsSync } = module.exists;

if (!(typeof exports === 'undefined')) {
  module.exports.exists = exists;
  module.exports.existsSync = existsSync;
}
