import { existsSync, lstatSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import ora from 'ora';
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
}

function validateOptions(options: ExtractorOptions) {
  const {
    data, destination, filePath, output, range, saveRaw,
  } = options;

  if (!dataEntities.includes(data.toLowerCase())) {
    throw new Error(`'data' must be one of ${dataEntities.join(', ')}`);
  }

  if (!filePath) {
    throw new Error("'filePath' is required");
  }

  if (!existsSync(filePath) || !lstatSync(filePath).isFile() || !filePath.match(/\.pdf$/)) {
    throw new Error("'filePath' must be a PDF path");
  }

  if (destination) {
    if (!existsSync(destination) || !lstatSync(destination).isDirectory()) {
      throw new Error("'destination' must be a directory path");
    }
  }

  if (output && !output.match(/^[A-Za-z0-9_\- ]+$/)) {
    throw new Error("'output' contains forbidden character(s)");
  }

  if (range && !range.match(/^(?:\d-?,?)+\b$/)) {
    throw new Error("'range' format is invalid");
  }

  if (saveRaw && typeof saveRaw !== 'boolean') {
    throw new Error("'saveRaw' must be a boolean");
  }

  return options;
}

export default async function idnxtr(options: ExtractorOptions) {
  const spinner = ora();
  const {
    data, destination = process.cwd(), filePath, output, range, saveRaw,
  } = validateOptions(options);

  spinner.start('Extracting data');

  const { pageContents, numPages, pagesExtracted } = await extractFromPdf(filePath, range);
  const rows = extractRows(pageContents.join('\n'), { trim: true, removeEmpty: true });
  if (saveRaw) {
    writeFileSync(`${destination}/raw-${output ?? data}.txt`, pageContents.join('\n'));
  }

  spinner.succeed(`${pagesExtracted}/${numPages} pages extracted (${rows.length} rows)`);

  const unparseOptions: Papa.UnparseConfig = {
    escapeChar: '\\',
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
  writeFileSync(`${destination}/${output ?? data}.csv`, Papa.unparse(results, unparseOptions));

  spinner.succeed(`${results.length} data transformed`);
}
