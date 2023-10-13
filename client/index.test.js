/* global document, window, Event */
import Client from '.';

// mock the Detect import
jest.mock('./utils/detect');

/**
 * @test {Client}
 */
describe('Client', () => {
  const instance = new Client();

  /**
   * @test {Client#constructor}
   */
  it('.constructor()', () => {
    expect(Client).toBeDefined();
  });
});