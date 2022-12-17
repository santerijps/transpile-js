export class AssertionError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
  }
}

/**
 *
 * @param {boolean} condition
 * @param {string} message
 */
export function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message);
  }
}
