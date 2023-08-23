import { readFileSync } from 'fs';
import PdfReader from './pdf-reader.js';

/**
 * Extract text from PDF.
 */
export async function extractFromPdf(filePath: string) {
  const pdfReader = new PdfReader(filePath);
  await pdfReader.load();

  const numPages = pdfReader.getNumPages();
  const promises: Promise<string>[] = [];

  for (let i = 1; i <= numPages; i += 1) {
    promises.push(pdfReader.getPageContentString(i));
  }

  return {
    numPages,
    pageContents: await Promise.all(promises),
  };
}

interface ExtractRowsOptions {
  /**
   * Remove whitespaces at the beginning and the end of each row.
   */
  trim?: boolean,
  /**
   * Remove empty rows.
   */
  removeEmpty?: boolean,
}

/**
 * Extract rows from string data.
 */
export function extractRows(data: string, options?: ExtractRowsOptions) {
  let rows = data.split('\n');

  if (options?.trim) {
    rows = rows.map((row) => row.trim());
  }

  if (options?.removeEmpty) {
    rows = rows.filter((row) => row !== '');
  }

  return rows;
}

/**
 * Extract rows in a text file (.txt or .csv).
 */
export function extractTxtFileRows(filePath: string, options?: ExtractRowsOptions) {
  return extractRows(readFileSync(filePath, { encoding: 'utf8' }), options);
}
