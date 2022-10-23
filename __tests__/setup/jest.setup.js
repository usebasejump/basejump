import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";
import fetchMock from "jest-fetch-mock";

/**
 * This is a workaround for jsdom not supporting the TextEncoder and TextDecoder APIs.
 */
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

/**
 * Setup tests for mocking the fetch API.
 */
fetchMock.enableMocks();

beforeEach(() => {
  // clear out the mocks
  fetch.resetMocks();
  jest.clearAllMocks();
});
