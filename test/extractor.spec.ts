import path from 'path';
import { describe, expect, test } from 'vitest';
import { extractFromPdf, extractTxtFileRows } from '~/extractor.js';

describe('Extractor', () => {
  test('extractFromPdf', async () => {
    const { numPages, pageContents } = await extractFromPdf(path.resolve(__dirname, 'data/REF-2022-2_regencies-11.pdf'));

    expect(numPages).toEqual(2);
    expect(pageContents).toHaveLength(2);
    expect(pageContents).toEqual(
      expect.arrayContaining([expect.any(String)]),
    );
  });

  test('extractRowsFromTextFile', () => {
    const rows = extractTxtFileRows(path.resolve(__dirname, 'data/regencies.txt'));

    expect(rows).toHaveLength(10);
    expect(rows).toEqual(
      expect.arrayContaining([expect.any(String)]),
    );
  });
});
