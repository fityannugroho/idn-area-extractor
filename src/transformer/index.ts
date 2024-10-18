export interface Transformer<T = unknown, U = unknown> {
  /**
   * Get the regex to transform.
   */
  getRegex(): RegExp;

  /**
   * Prepare the data rows.
   */
  prepareData?: (data: string[]) => string[];

  /**
   * Transform the data from string.
   *
   * @returns The transformed data or null if the data does not match.
   */
  transform(data: string): T | null;

  /**
   * Transform the data from string array.
   *
   * @returns The list of transformed data.
   */
  transformMany(data: string[]): T[];

  /**
   * Transform the data for CSV.
   *
   * Note: the order of the attributes is important.
   *
   * @param data The list of transformed data.
   */
  transformForCsv(data: T[]): U[];
}
