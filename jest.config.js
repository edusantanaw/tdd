module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  collectCoverageFrom: ["**/src/**/*.js"],
  preset: "@shelf/jest-mongodb",
  watchPathIgnorePatterns: ['globalConfig'],
};
