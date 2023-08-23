import { existsSync, lstatSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { extractFromPdf, extractRows } from './extractor.js';
import DistrictTransformer from './transformer/DistrictTransformer.js';
import IslandTransformer from './transformer/IslandTransformer.js';
import RegencyTransformer from './transformer/RegencyTransformer.js';
import VillageTransformer from './transformer/VillageTransformer.js';
import { Transformer } from './transformer/index.js';

export type DataEntity = 'regency' | 'district' | 'island' | 'village';
export const dataEntities = ['regency', 'district', 'island', 'village'];

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
}

function validateOptions(options: ExtractorOptions) {
  const {
    data, destination, filePath, output,
  } = options;

  if (!dataEntities.includes(data.toLowerCase())) {
    throw new Error(`'data' must be one of: ${dataEntities.join(', ')}.`);
  }

  if (!filePath) {
    throw new Error("'filePath' is required.");
  }

  if (!existsSync(filePath) || !lstatSync(filePath).isFile() || !filePath.match(/\.pdf$/)) {
    throw new Error("'filePath' must be a PDF path.");
  }

  if (destination) {
    if (!existsSync(destination) || !lstatSync(destination).isDirectory()) {
      throw new Error("'destination' must be a directory path.");
    }
  }

  if (output && !output.match(/^[A-Za-z0-9_\- ]+$/)) {
    throw new Error("'output' contains forbidden character(s).");
  }

  return options;
}

export default async function idnxtr(options: ExtractorOptions) {
  const {
    data, destination = process.cwd(), filePath, output,
  } = validateOptions(options);

  const { pageContents } = await extractFromPdf(filePath);
  const rows = extractRows(pageContents.join('\n'), { trim: true, removeEmpty: true });
  const unparseOptions: Papa.UnparseConfig = {
    escapeChar: '\\',
  };

  let transformer: Transformer;
  switch (data) {
    case 'regency':
      transformer = new RegencyTransformer();
      break;
    case 'district':
      transformer = new DistrictTransformer();
      break;
    case 'island':
      transformer = new IslandTransformer();
      break;
    default:
      transformer = new VillageTransformer();
      break;
  }

  const results = transformer.transformMany(rows);
  const fileName = output ?? `list-of-${data}`;
  writeFileSync(`${destination}/${fileName}.csv`, Papa.unparse(results, unparseOptions));
}
