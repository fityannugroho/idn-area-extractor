import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import PdfReader from '~/pdf-reader.js';

describe('PdfReader', () => {
  let pdfReader: PdfReader;

  beforeEach(() => {
    pdfReader = new PdfReader(
      path.resolve(__dirname, './data/REF-2022-2_regencies-11.pdf'),
    );
  });

  describe('getNumPages', () => {
    it('should throw error if load() not called', () => {
      expect(() => pdfReader.getNumPages()).toThrow('PDF not loaded');
    });

    it('should return number of pages', async () => {
      await pdfReader.load();
      expect(pdfReader.getNumPages()).toEqual(2);
    });
  });

  describe('getPageContent', () => {
    it('should throw error if load() not called', async () => {
      await expect(pdfReader.getPageContent()).rejects.toThrow(
        'PDF not loaded',
      );
    });

    it('should return page content', async () => {
      await pdfReader.load();
      const contentItems = await pdfReader.getPageContent();
      expect(contentItems).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            str: expect.any(String) as string,
            hasEOL: expect.any(Boolean) as boolean,
          }),
        ]),
      );
    });
  });

  describe('getPageContentString', () => {
    it('should throw error if load() not called', async () => {
      await expect(pdfReader.getPageContentString()).rejects.toThrow(
        'PDF not loaded',
      );
    });

    it('should return page content', async () => {
      await pdfReader.load();
      const contentString = await pdfReader.getPageContentString();
      expect(contentString).toEqual(expect.any(String));
    });
  });
});
