import { readFileSync } from 'fs';
import * as mr from 'multi-integer-range';
import PdfReader from './pdf-reader.js';

export interface PdfExtractResult {
  /**
   * Total number of pages in the PDF.
   */
  numPages: number
  /**
   * The number of pages that have been extracted.
   */
  pagesExtracted: number
  /**
   * The range of pages that have been extracted.
   */
  pageRange: string
  /**
   * The contents extracted from each page.
   */
  pageContents: string[]
}

/**
 * Extract text from PDF.
 *
 * @param filePath The path to the PDF file.
 * @param range The specific PDF page range to be extracted.
 */
export async function extractFromPdf(filePath: string, range?: string): Promise<PdfExtractResult> {
  const pdfReader = await new PdfReader().load(filePath);
  const numPages = pdfReader.getNumPages();
  const pageRange = mr.initialize(range ?? [[1, numPages]]);
  const pageContents: string[] = [];

  for (const [start, end] of pageRange) {
    if (start < 1 || end > numPages) {
      throw new Error('Page range exceeds the expected range');
    }

    for (let i = start; i <= end; i += 1) {
      pageContents.push(pdfReader.getPageContentString(i));
    }
  }

  return {
    numPages,
    pagesExtracted: mr.flatten(pageRange).length,
    pageRange: mr.stringify(pageRange),
    pageContents,
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
