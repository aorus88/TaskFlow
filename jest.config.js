module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/backend/**/*.test.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};