module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    globalSetup: '<rootDir>/__tests__/globalSetup.js',
    globalTeardown: '<rootDir>/__tests__/globalTeardown.js',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'routes/**/*.js',
        'middleware/**/*.js',
        'models/**/*.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 30000,
    forceExit: true
};
