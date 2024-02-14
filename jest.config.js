module.exports = () => ({
    rootDir: ".",
    moduleFileExtensions: ["ts", "js"],
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/**/__tests__/**/*.spec.[jt]s"],
    maxConcurrency: 10,
    collectCoverageFrom: [
        "<rootDir>/src/**/*.{js,ts}",
        // Generic exclusions
        "!**/__tests__/**/*",
        "!**/stories/**/*",
        "!**/{I,i}ndex.*",
    ],
    coverageDirectory: "<rootDir>/coverage",
    coverageReporters: ["text"],
    verbose: true,
    bail: false,
    reporters: ["default", ["jest-junit", { outputName: "junit.xml" }]],
});
