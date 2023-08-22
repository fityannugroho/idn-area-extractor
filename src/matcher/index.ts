export interface Matcher<T> {
  /**
   * Get the regex to match.
   */
  getRegex(): RegExp

  /**
   * Method to transform the data.
   *
   * @param match The match result of the regex.
   * @returns The transformed data.
   */
  transform(match: RegExpMatchArray): T
}
