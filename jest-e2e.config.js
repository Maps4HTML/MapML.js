module.exports = {
    displayName: 'E2E Testing',
    preset: "jest-playwright-preset",
    globals: { "PATH": "http://localhost:30001" },
    testMatch: ["**/test/e2e/*.test.js"]
};