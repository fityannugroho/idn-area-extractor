import { existsSync, lstatSync, writeFileSync } from 'fs';
import ora from 'ora';
import Papa from 'papaparse';
import ValidationError from './errors/ValidationError.js';
import { extractFromPdf, extractRows } from './extractor.js';
import DistrictTransformer from './transformer/DistrictTransformer.js';
import IslandTransformer from './transformer/IslandTransformer.js';
import RegencyTransformer from './transformer/RegencyTransformer.js';
import VillageTransformer from './transformer/VillageTransformer.js';
import { Transformer } from './transformer/index.js';

export type DataEntity = 'regencies' | 'districts' | 'islands' | 'villages';
export const dataEntities = ['regencies', 'districts', 'islands', 'villages'];

export interface ExtractorOptions {
  /**
   * Which kind of data should be extracted.
   */
  data: DataEntity

  /**
   * The folder destination.
   *
   * @default
   * ```js
   * process.cwd()
   * ```
   */
  destination?: string

  /**
   * Set a specific output file name without a file extension.
   *
   * The output file will have .csv extension.
   */
  output?: string

  /**
   * The path to the PDF file.
   */
  filePath: string

  /**
   * The specific PDF page range to be extracted.
   *
   * @example `1-2,5,7-9`.
   */
  range?: string

  /**
   * Save the extracted raw data into .txt file.
   */
  saveRaw?: boolean

  /**
   * Disable all logs.
   */
  silent?: boolean
}

/**
 * @throws {ValidationError} If there are any invalid options.
 */
function validateOptions(options: ExtractorOptions): ExtractorOptions {
  const {
    data, destination, filePath, output, range, saveRaw, silent,
  } = options;

  if (!dataEntities.includes(data)) {
    throw new ValidationError(`'data' must be one of ${dataEntities.join(', ')}`);
  }

  if (!filePath.trim()) {
    throw new ValidationError("'filePath' is required");
  }

  if (!existsSync(filePath) || !lstatSync(filePath).isFile() || !filePath.match(/\.pdf$/)) {
    throw new ValidationError("'filePath' must be a PDF path");
  }

  if (typeof destination !== 'undefined') {
    if (!destination.trim()) {
      throw new ValidationError("'destination' must not be empty");
    }

    if (!existsSync(destination) || !lstatSync(destination).isDirectory()) {
      throw new ValidationError("'destination' must be a directory path");
    }
  }

  if (typeof output !== 'undefined') {
    if (output.trim() === '') {
      throw new ValidationError("'output' must not be empty");
    }

    if (!output.match(/^[A-Za-z0-9_\- ]+$/)) {
      throw new ValidationError("'output' contains forbidden character(s)");
    }
  }

  if (typeof range !== 'undefined') {
    if (!range.match(/^(?:\d-?,?)+\b$/)) {
      throw new ValidationError("'range' format is invalid");
    }
  }

  if (saveRaw && typeof saveRaw !== 'boolean') {
    throw new ValidationError("'saveRaw' must be a boolean");
  }

  if (silent && typeof silent !== 'boolean') {
    throw new ValidationError("'silent' must be a boolean");
  }

  return {
    ...options,
    output: output?.trim(),
  };
}

export default async function idnxtr(options: ExtractorOptions) {
  const {
    data, destination = process.cwd(), filePath, output, range, saveRaw, silent,
  } = validateOptions(options);

  const spinner = ora({ isSilent: silent });
  spinner.start('Extracting data');

  const { pageContents, numPages, pagesExtracted } = await extractFromPdf(filePath, range);
  const rows = extractRows(pageContents.join('\n'), { trim: true, removeEmpty: true });
  if (saveRaw) {
    writeFileSync(`${destination}/raw-${output ?? data}.txt`, pageContents.join('\n'));
  }

  spinner.succeed(`${pagesExtracted}/${numPages} pages extracted (${rows.length} rows)`);

  const unparseOptions: Papa.UnparseConfig = {
    escapeChar: '\\',
    newline: '\n',
  };

  let transformer: Transformer;
  switch (data) {
    case 'regencies':
      transformer = new RegencyTransformer();
      break;
    case 'districts':
      transformer = new DistrictTransformer();
      break;
    case 'islands':
      transformer = new IslandTransformer();
      break;
    default:
      transformer = new VillageTransformer();
      break;
  }

  spinner.start('Transforming data');

  const results = transformer.transformMany(rows);
  writeFileSync(
    `${destination}/${output ?? data}.csv`,
    Papa.unparse(transformer.transformForCsv(results), unparseOptions),
  );

  spinner.succeed(`${results.length} data transformed`);
}
