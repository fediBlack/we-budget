module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@webudget/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@webudget/shared-types/(.*)$': '<rootDir>/../../packages/shared-types/src/$1',
  },
};
