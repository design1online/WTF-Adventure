#!/usr/bin/env node

import Log from 'log';
import fs from 'fs';
import file from '../file';
import processMap from './processmap';

const log = new Log(Log.DEBUG);
const source = process.argv[2];

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

function onMap(data) {
  parseClient(data, '../../../data/maps/world_client');
  parseServer(data, '../../../data/map/world_server');
}

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
