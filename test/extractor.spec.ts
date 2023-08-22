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

  describe('extractTxtFileRows', () => {
    test('default', () => {
      const rows = extractTxtFileRows(path.resolve(__dirname, 'data/test.txt'));

      expect(rows).toHaveLength(12);
      expect(rows).toEqual(
        expect.arrayContaining([expect.any(String)]),
      );
    });

    test('with trim option', () => {
      const rows = extractTxtFileRows(path.resolve(__dirname, 'data/test.txt'), { trim: true });

      expect(rows[0]).toStrictEqual('1');
    });

    test('with removeEmpty option', () => {
      const rows = extractTxtFileRows(path.resolve(__dirname, 'data/test.txt'), { removeEmpty: true });

      expect(rows).toHaveLength(8);
      expect(rows).toEqual(
        expect.arrayContaining([expect.any(String)]),
      );
    });
  });
});
