import fs from 'fs';
import path from 'path';

const Filter = /^([^\.].*)\.js$/;

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
