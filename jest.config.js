module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: ['@babel/preset-env']
    }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'public/js/**/*.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  projects: [
    {
      displayName: 'client',
      testMatch: ['<rootDir>/public/**/*.test.js'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'server',
      testMatch: ['<rootDir>/src/**/*.test.js'],
      testEnvironment: 'node'
    }
  ]
} 