module.exports = {
  transform: {
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: [
          ['next/babel', {
            'preset-react': {
              runtime: 'automatic',
            },
          }],
          '@babel/preset-typescript',
          '@babel/preset-env',
        ],
      },
    ],
  },
  testEnvironment: 'jsdom',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
  moduleFileExtensions: ['js', 'ts', 'tsx', 'jsx'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@/client/(.*)$': '<rootDir>/client/$1',
    '^@/component/(.*)$': '<rootDir>/components/$1',
    '^@/styles/(.*)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(png|gif|svg|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|scss|sass)$': '<rootDir>/__mocks__/fileMock.js',
    '^next/image$': '<rootDir>/__mocks__/nextImageMock.js',
  },
  collectCoverageFrom: [
    'client/**/*.{js,ts,tsx}',
    '!client/**/__mocks__/**',
    '!client/**/*.test.{js,ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js', '@testing-library/jest-dom'],
};
