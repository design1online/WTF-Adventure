/* eslint-disable */
module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js',
      '!src/**/__tests__/*.js',
      'src/**/*.ts',
      'src/**/*.tsx',
      '!src/**/__tests__/*.ts',
      '!src/**/__tests__/*.tsx',
      'setupTests.js'],

    tests: [
      'src/**/__tests__/*.js',
      'src/**/__tests__/*.ts',
      'src/**/__tests__/*.tsx'
    ],

    env: {
      type: 'node',
      runner: 'node',
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel(),
      '**/*.ts': wallaby.compilers.babel(),
      '**/*.tsx': wallaby.compilers.babel(),
    },

    testFramework: 'jest',
  };
};
