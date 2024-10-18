import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { extractFromPdf, extractTxtFileRows } from '~/extractor.js';

describe('extractFromPdf', () => {
  const filePath = path.resolve(__dirname, 'data/REF-2022-2_regencies-11.pdf');

  test('default', async () => {
    const result = await extractFromPdf(filePath);

    expect(result.pageContents).toHaveLength(2);
    expect(result.pageContents).toEqual(
      expect.arrayContaining([expect.any(String)]),
    );
    expect(result).toStrictEqual(
      expect.objectContaining({
        numPages: 2,
        pagesExtracted: result.numPages,
        pageRange: '1-2',
      }),
    );
  });

  test('with specific range', async () => {
    const result = await extractFromPdf(filePath, '2');

    expect(result.pageContents).toHaveLength(1);
    expect(result).toStrictEqual(
      expect.objectContaining({
        numPages: 2,
        pagesExtracted: 1,
        pageRange: '2',
      }),
    );
  });

  test('with invalid range', async () => {
    await expect(extractFromPdf(filePath, '3')).rejects.toThrow(
      'Page range exceeds the expected range',
    );

    await expect(extractFromPdf(filePath, '0-1')).rejects.toThrow(
      'Page range exceeds the expected range',
    );

    await expect(extractFromPdf(filePath, '1-')).rejects.toThrow(
      'Unexpected unbouded range notation',
    );

    await expect(extractFromPdf(filePath, '-1')).rejects.toThrow(
      'Unexpected unbouded range notation',
    );

    await expect(extractFromPdf(filePath, 'abc')).rejects.toThrow(
      'Invalid input',
    );
  });
});

describe('extractTxtFileRows', () => {
  const filePath = path.resolve(__dirname, 'data/test.txt');

  test('default', () => {
    const rows = extractTxtFileRows(filePath);

    expect(rows).toHaveLength(12);
    expect(rows).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  test('with trim option', () => {
    const rows = extractTxtFileRows(filePath, { trim: true });

    expect(rows[0]).toStrictEqual('1');
  });

  test('with removeEmpty option', () => {
    const rows = extractTxtFileRows(filePath, { removeEmpty: true });

    expect(rows).toHaveLength(8);
    expect(rows).toEqual(expect.arrayContaining([expect.any(String)]));
  });
});
