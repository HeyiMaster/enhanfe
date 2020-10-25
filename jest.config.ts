export default {
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleNameMapper: {
    '@(.*)$': '<rootDir>/src/$1',
  },
};
