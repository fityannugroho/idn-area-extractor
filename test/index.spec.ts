import fs from 'fs';
import path from 'path';
import {
  beforeAll, beforeEach, describe, expect, it,
} from 'vitest';
import { extractTxtFileRows } from '~/extractor.js';
import idnxtr, { DataEntity, ExtractorOptions } from '~/index.js';

describe('idnxtr', () => {
  const distPath = path.resolve('dist');
  const filePath = path.resolve(__dirname, 'data/REF-2022-2_regencies-11.pdf');

  beforeAll(() => {
    // Create dist folder to store output files
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }
  });

  describe('negative tests', () => {
    it('should throw error if data is invalid', async () => {
      await expect(idnxtr({ data: 'lorem' as DataEntity, filePath })).rejects.toThrow();
    });

    it('should throw error if filePath is empty or not a PDF path', async () => {
      await expect(idnxtr({ data: 'regencies', filePath: '' })).rejects.toThrow("'filePath' is required");
      await expect(idnxtr({ data: 'regencies', filePath: distPath })).rejects.toThrow("'filePath' must be a PDF path");
      await expect(idnxtr({ data: 'regencies', filePath: path.resolve(__dirname, 'data/test.txt') })).rejects.toThrow("'filePath' must be a PDF path");
    });

    it('should throw error if destination is not a folder path', async () => {
      await expect(idnxtr({ data: 'regencies', filePath, destination: filePath })).rejects.toThrow("'destination' must be a directory path");
    });

    it('should throw error if output contains forbidden characters for file name', async () => {
      const errMsg = "'output' contains forbidden character(s)";

      await expect(idnxtr({ data: 'regencies', filePath, output: 'output.csv' })).rejects.toThrow(errMsg);
      await expect(idnxtr({ data: 'regencies', filePath, output: 'new/data' })).rejects.toThrow(errMsg);
    });

    it('should throw error if range format is invalid', async () => {
      const errMsg = "'range' format is invalid";

      await expect(idnxtr({ data: 'regencies', filePath, range: 'abc' })).rejects.toThrow(errMsg);
      await expect(idnxtr({ data: 'regencies', filePath, range: '1-' })).rejects.toThrow(errMsg);
      await expect(idnxtr({ data: 'regencies', filePath, range: '-2' })).rejects.toThrow(errMsg);
      await expect(idnxtr({ data: 'regencies', filePath, range: '1,' })).rejects.toThrow(errMsg);
      await expect(idnxtr({ data: 'regencies', filePath, range: '1.2' })).rejects.toThrow(errMsg);
      await expect(idnxtr({ data: 'regencies', filePath, range: '1-2-3' })).rejects.toThrow('Invalid input');
    });

    it('should throw error if range exceeds the expected range', async () => {
      const errMsg = 'Page range exceeds the expected range';

      await expect(idnxtr({
        data: 'regencies', filePath, range: '0-2', silent: true,
      })).rejects.toThrow(errMsg);

      await expect(idnxtr({
        data: 'regencies', filePath, range: '1-5', silent: true,
      })).rejects.toThrow(errMsg);
    });

    it('should throw error if saveRaw is invalid', async () => {
      await expect(idnxtr({ data: 'regencies', filePath, saveRaw: 1 as unknown as boolean })).rejects.toThrow();
      await expect(idnxtr({ data: 'regencies', filePath, saveRaw: 'true' as unknown as boolean })).rejects.toThrow();
    });
  });

  describe('positive tests', () => {
    const flags: Partial<ExtractorOptions> = {
      destination: distPath,
      silent: true,
    };

    beforeEach(() => {
      // Remove all files in dist folder
      fs.readdir(distPath, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlink(path.join(distPath, file), (errUnlink) => {
            if (errUnlink) throw errUnlink;
          });
        }
      });
    });

    it('should create a new CSV file: regencies.csv', async () => {
      await idnxtr({ data: 'regencies', filePath, ...flags });
      const resultPath = `${distPath}/regencies.csv`;

      expect(fs.existsSync(resultPath)).toBeTruthy();
      expect(extractTxtFileRows(resultPath).at(0))
        .toStrictEqual('code,province_code,name');
    });

    it('should create a new CSV file: districts.csv', async () => {
      await idnxtr({
        data: 'districts',
        filePath: path.resolve(__dirname, 'data/REF-2022-2_districts-11.pdf'),
        ...flags,
      });
      const resultPath = `${distPath}/districts.csv`;

      expect(fs.existsSync(resultPath)).toBeTruthy();
      expect(extractTxtFileRows(resultPath).at(0))
        .toStrictEqual('code,regency_code,name');
    });

    it('should create a new CSV file: islands.csv', async () => {
      await idnxtr({
        data: 'islands',
        filePath: path.resolve(__dirname, 'data/REF-2022-2_islands-11.pdf'),
        ...flags,
      });
      const resultPath = `${distPath}/islands.csv`;

      expect(fs.existsSync(resultPath)).toBeTruthy();
      expect(extractTxtFileRows(resultPath).at(0))
        .toStrictEqual('code,regency_code,coordinate,is_populated,is_outermost_small,name');
    });

    it('should create a new CSV file: villages.csv', async () => {
      await idnxtr({
        data: 'villages',
        filePath: path.resolve(__dirname, 'data/REF-2022-2_villages-11.pdf'),
        ...flags,
      });
      const resultPath = `${distPath}/villages.csv`;

      expect(fs.existsSync(resultPath)).toBeTruthy();
      expect(extractTxtFileRows(resultPath).at(0))
        .toStrictEqual('code,district_code,name');
    });

    it('should create a .txt file that contains raw data', async () => {
      await idnxtr({
        data: 'regencies', filePath, saveRaw: true, ...flags,
      });

      expect(fs.existsSync(`${distPath}/raw-regencies.txt`)).toBeTruthy();
    });
  });
});
