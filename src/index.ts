import { fileTypeFromFile } from 'file-type';
import {
  getDistricts, getIslands, getRegencies, getVillages,
} from 'idn-area-data';
import { diff } from 'jest-diff';
import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import Papa from 'papaparse';
import DirectoryError from './errors/DirectoryError.js';
import ValidationError from './errors/ValidationError.js';
import { extractFromPdf, extractRows, extractTxtFileRows } from './extractor.js';
import DistrictTransformer from './transformer/DistrictTransformer.js';
import IslandTransformer from './transformer/IslandTransformer.js';
import RegencyTransformer from './transformer/RegencyTransformer.js';
import VillageTransformer from './transformer/VillageTransformer.js';
import { Transformer } from './transformer/index.js';

export type DataEntity = 'regencies' | 'districts' | 'islands' | 'villages';
export const dataEntities: readonly DataEntity[] = [
  'regencies', 'districts', 'islands', 'villages',
];

export async function isFilePdf(fpath: string) {
  const fileType = await fileTypeFromFile(fpath);
  return fileType?.ext === 'pdf' && fileType.mime === 'application/pdf';
}

async function isFileTxt(fpath: string) {
  const fileType = await fileTypeFromFile(fpath);
  return typeof fileType === 'undefined' && fpath.toLowerCase().endsWith('.txt');
}

export interface ExtractorOptions {
  /**
   * Compare the extracted data with the latest data.
   */
  compare?: boolean

  /**
   * Which kind of data should be extracted.
   */
  data: DataEntity

  /**
   * The folder destination.
   *
   * The default is the current working directory.
   */
  destination?: string

  /**
   * Set a specific output file name without a file extension.
   *
   * The output file will have .csv extension.
   */
  output?: string

  /**
   * The path to the PDF or TXT file.
   */
  filePath: string

  /**
   * The specific PDF page range to be extracted.
   *
   * @example `1-2,5,7-9`.
   */
  range?: string

  /**
   * Save the extracted raw data into .txt file (only works with PDF data).
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
async function validateOptions(options: ExtractorOptions): Promise<ExtractorOptions> {
  const {
    compare, data, destination, filePath, output, range, saveRaw, silent,
  } = options;

  if (!dataEntities.includes(data)) {
    throw new ValidationError(`'data' must be one of ${dataEntities.join(', ')}`);
  }

  if (!filePath.trim()) {
    throw new ValidationError("'filePath' is required");
  }

  if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
    throw new ValidationError("'filePath' does not exists");
  }

  const isPdf = await isFilePdf(filePath);

  if (!(isPdf || await isFileTxt(filePath))) {
    throw new ValidationError("'filePath' must be a PDF or TXT path");
  }

  if (compare && typeof compare !== 'boolean') {
    throw new ValidationError("'compare' must be a boolean");
  }

  if (typeof destination !== 'undefined') {
    if (!destination.trim()) {
      throw new ValidationError("'destination' must not be empty");
    }

    // Validate the directory path syntax and ensure it is a directory without a filename.
    const { base, name } = path.parse(destination);
    if (base !== name) {
      throw new ValidationError("'destination' must be a valid directory path");
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

  if (typeof range === 'string' && !isPdf) {
    throw new ValidationError("'range' only works with PDF file");
  }

  if (saveRaw && typeof saveRaw !== 'boolean') {
    throw new ValidationError("'saveRaw' must be a boolean");
  }

  if (saveRaw && !isPdf) {
    throw new ValidationError("'saveRaw' only works with PDF file");
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
    compare, data, destination = process.cwd(), filePath, output, range, saveRaw, silent,
  } = await validateOptions(options);

  // Create the directory if it doesn't exist.
  if (!fs.existsSync(destination)) {
    try {
      fs.mkdirSync(destination, { recursive: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new DirectoryError(error.message);
      }
      throw new DirectoryError(`Failed to create '${destination}' directory path`);
    }
  }

  const spinner = ora({ isSilent: silent });
  spinner.start('Extracting data');

  let rows: string[] = [];

  if (await isFilePdf(filePath)) {
    const { pageContents, numPages, pagesExtracted } = await extractFromPdf(filePath, range);
    rows = extractRows(pageContents.join('\n'), { trim: true, removeEmpty: true });

    if (saveRaw) {
      fs.writeFileSync(
        path.resolve(destination, `raw-${output ?? data}.txt`),
        pageContents.join('\n'),
      );
    }

    spinner.succeed(`${pagesExtracted}/${numPages} pages extracted (${rows.length} rows)`);
  } else {
    rows = extractTxtFileRows(filePath, { trim: true, removeEmpty: true });
    spinner.succeed(`${rows.length} rows found`);
  }

  const unparseOptions: Papa.UnparseConfig = {
    escapeChar: '',
    newline: '\n',
    quoteChar: '',
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
  const resultsCsv = Papa.unparse(transformer.transformForCsv(results), unparseOptions);
  fs.writeFileSync(
    path.resolve(destination, `${output ?? data}.csv`),
    resultsCsv,
  );

  spinner.succeed(`${results.length} data transformed`);

  if (!compare) {
    return;
  }

  spinner.start('Comparing data');

  let latestData: unknown[];
  switch (data) {
    case 'regencies':
      latestData = await getRegencies();
      break;
    case 'districts':
      latestData = await getDistricts();
      break;
    case 'islands':
      latestData = await getIslands();
      break;
    default:
      latestData = await getVillages();
      break;
  }

  const latestDataCsv = Papa.unparse<unknown>(latestData, unparseOptions);
  const noColor = (arg: string) => arg;
  const diffResults = diff(latestDataCsv, resultsCsv, {
    contextLines: 2,
    expand: false,
    includeChangeCounts: true,
    aColor: noColor,
    bColor: noColor,
    changeColor: noColor,
    commonColor: noColor,
    patchColor: noColor,
  });

  if (diffResults) {
    fs.writeFileSync(
      path.resolve(destination, `diff-${output ?? data}.txt`),
      diffResults,
    );
  }

  spinner.succeed('Data compared');
}
