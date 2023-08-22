export interface Transformer<T> {
  /**
   * Get the regex to transform.
   */
  getRegex(): RegExp

  /**
   * Prepare the data rows.
   */
  prepareData?: (data: string[]) => string[]

  /**
   * Transform the data from string.
   *
   * @returns The transformed data or null if the data does not match.
   */
  transform(data: string): T | null

  /**
   * Transform the data from string array.
   *
   * @returns The list of transformed data.
   */
  transformMany(data: string[]): T[]
}
