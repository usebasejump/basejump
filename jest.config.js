const nextJest = require("next/jest");
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/jest.setup.js"],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  preset: "ts-jest",
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/__tests__/setup/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/__tests__/setup/"],
  /**
   * This is where you'll define node_module libraries that need to be transformed still
   * By default all node_modules are ignored
   */
  transformIgnorePatterns: ["/node_modules/(?!(@supabase|jose)/)"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
  collectCoverageFrom: [
    "<rootDir>/src/utils/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/components/**/*.{js,jsx,ts,tsx}",
  ],
};

module.exports = async () => {
  // createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
  const nextDefaults = await createJestConfig(customJestConfig)();

  // Next forces the transformIgnorePatterns to include `node_modules`, but that breaks b/c of the supabase transform issue
  // so we need to override it with our own transformIgnorePatterns
  nextDefaults.transformIgnorePatterns = [
    "/node_modules/(?!(@supabase|jose)/)",
    "^.+\\.module\\.(css|sass|scss)$",
  ];

  return nextDefaults;
};
