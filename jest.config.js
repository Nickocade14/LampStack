// Jest runs the tests only. The app itself is served by Apache/PHP (LAMP).
module.exports = {
  projects: [
    {
      displayName: "unit",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
    },
    {
      displayName: "integration",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
    },
  ],
};
