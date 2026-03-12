#!/usr/bin/env node

import Log from 'log';
import fs from 'fs';
import file from '../file';
import processMap from './processmap';

/**
 * Logger instance used for debug and error output
 * @type {Log}
 */
const log = new Log(Log.DEBUG);
/**
 * Path to the source map file, provided as the first command-line argument
 * @type {String}
 */
const source = process.argv[2];

/**
 * Processes and writes the client version of the map to JSON and JS files
 * @param {Object} data the raw map data to process
 * @param {String} destination the output path without extension
 */
function parseClient(data, destination) {
  let map = JSON.stringify(
    processMap(data, {
      mode: 'client',
    }),
  );

  fs.writeFile(`${destination}.json`, map, (err) => {
    if (err) {
      log.error(JSON.stringify(err));
    } else {
      log.debug(`[Client] Map saved at: ${destination}.json`);
    }
  });

  map = `var mapData = ${map}`;

  fs.writeFile(`${destination}.js`, map, (err) => {
    if (err) log.error(JSON.stringify(err));
    else log.debug(`[Client] Map saved at: ${destination}.js`);
  });
}

/**
 * Processes and writes the server version of the map to a JSON file
 * @param {Object} data the raw map data to process
 * @param {String} destination the output path without extension
 */
function parseServer(data, destination) {
  const map = JSON.stringify(
    processMap(data, {
      mode: 'server',
    }),
  );

  fs.writeFile(`${destination}.json`, map, (err) => {
    if (err) {
      log.error(JSON.stringify(err));
    } else {
      log.debug(`[Server] Map saved at: ${destination}.json`);
    }
  });
}

/**
 * Processes raw map data and writes both client and server map output files
 * @param {Object} data the raw map data to process and export
 */
function onMap(data) {
  parseClient(data, '../../../data/maps/world_client');
  parseServer(data, '../../../data/map/world_server');
}

/**
 * Reads the source map file and passes its contents to onMap for processing
 */
function getMap() {
  file.exists(source, (exists) => {
    if (!exists) {
      log.error(`The file: ${source} could not be found.`);
      return;
    }

    fs.readFile(source, () => {
      onMap(JSON.parse(file.toString()));
    });
  });
}

getMap();
