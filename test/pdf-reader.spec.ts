import path from 'path';
import {
  beforeEach, describe, expect, it,
} from 'vitest';
import PdfReader from '~/pdf-reader.js';

describe('PdfReader', () => {
  let pdfReader: PdfReader;

  beforeEach(() => {
    pdfReader = new PdfReader();
  });

  describe('getNumPages', () => {
    it('should throw error if load() not called', () => {
      expect(() => pdfReader.getNumPages()).toThrow('PDF not loaded');
    });

    it('should return number of pages', async () => {
      await pdfReader.load(path.resolve(__dirname, './data/REF-2022-2_regencies-11.pdf'));
      expect(pdfReader.getNumPages()).toEqual(2);
    });
  });

  describe('getPageContentString', () => {
    it('should throw error if load() not called', () => {
      expect(() => pdfReader.getPageContentString()).toThrow('PDF not loaded');
    });

    it('should return page content', async () => {
      await pdfReader.load(path.resolve(__dirname, './data/REF-2022-2_regencies-11.pdf'));
      const contentString = pdfReader.getPageContentString();
      expect(contentString).toEqual(expect.any(String));
    });
  });
});
