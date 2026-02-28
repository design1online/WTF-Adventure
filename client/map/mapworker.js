/* global postMessage */
import _ from 'underscore';
import mapData from '../../../../data/maps/world_client';

/**
 * Builds the 2D collision grid on the mapData object from collision and blocking tile lists
 */
function loadCollisionGrid() {
  const tileIndex = 0;

  mapData.grid = [];

  for (let i = 0; i < mapData.height; i++) {
    mapData.grid[i] = [];
    for (let j = 0; j < mapData.width; j++) mapData.grid[i][j] = 0;
  }

  _.each(mapData.collisions, (tileIndex) => {
    const position = indexToGridPosition(tileIndex + 1);
    mapData.grid[position.y][position.x] = 1;
  });

  _.each(mapData.blocking, (tileIndex) => {
    const position = indexToGridPosition(tileIndex + 1);

    if (mapData.grid[position.y]) mapData.grid[position.y][position.x] = 1;
  });
}

/**
 * Computes the X coordinate from a flat tile index and map width
 * @param {Number} index the flat tile index
 * @param {Number} width the map width in tiles
 * @return {Number} the X grid coordinate
 */
function getX(index, width) {
  if (index === 0) {
    return 0;
  }

  return index % width === 0 ? width - 1 : (index % width) - 1;
}

/**
 * Web Worker message handler that loads the collision grid and posts the completed map data
 */
const onmessage = () => {
  loadCollisionGrid();
  postMessage(mapData);
};

/**
 * Converts a flat tile index to a 2D grid position
 * @param {Number} index the 1-based flat tile index
 * @return {{x: Number, y: Number}} the grid position
 */
function indexToGridPosition(index) {
  let x = 0;
  let y = 0;

  index -= 1; // eslint-disable-line

  x = getX(index + 1, mapData.width);
  y = Math.floor(index / mapData.width);

  return {
    x,
    y,
  };
}
