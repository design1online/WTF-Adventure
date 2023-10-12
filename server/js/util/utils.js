import Packets from '../network/packets.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const random = range => Math.floor(Math.random() * range);

export default {
  dirName: val => {
    const __filename = fileURLToPath(val);
    return dirname(__filename);
  },
  fileName: val => fileURLToPath(val),
  isInt: n => n % 1 === 0,
  random,
  randomRange: (min, max) => min + Math.random() * (max - min),
  randomInt,
  getDistance: (startX, startY, toX, toY) => {
    const x = Math.abs(startX - toX);
    const y = Math.abs(startY - toY);
    return x > y ? x : y;
  },
  positionOffset: radius => ({
    x: randomInt(0, radius),
    y: randomInt(0, radius),
  }),
  /**
   * There is seriously no way two clients can end up with the same ID
   */
  generateClientId: () => (
    randomInt(0, 1000000)
    + randomInt(0, 40000)
    + randomInt(0, 9000)
  ),
  generateInstance: (randomizer, id, modulo, posY) => (
    `${randomizer}${randomInt(0, id)}${randomizer}${randomInt(0, modulo)}${posY || 0}`
  ),
  generateRandomId: () => `${1}${random(0, 200)}${random(0, 20)}${2}`,
  validPacket: (packet) => {
    const keys = Object.keys(Packets);


    const filtered = [];

    for (let i = 0; i < keys.length; i += 1) {
      if (!keys[i].endsWith('Opcode')) {
        filtered.push(keys[i]);
      }
    }

    return packet > -1 && packet < Packets[filtered[filtered.length - 1]] + 1;
  },
};
