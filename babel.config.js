module.exports = {
  presets: [
    ['next/babel', {
      'preset-react': {
        runtime: 'automatic',
      },
    }],
    '@babel/preset-typescript',
    '@babel/preset-env',
  ],
};
