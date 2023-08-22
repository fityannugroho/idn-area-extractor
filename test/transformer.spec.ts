import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { transformData, transformDistricts, transformRegencies } from '~/transformer.js';
import { Matcher } from '~/matcher/index.js';
import RegencyMatcher from '~/matcher/RegencyMatcher.js';
import DistrictMatcher from '~/matcher/DistrictMatcher.js';

interface ValidationOptions {
  tag: string,
}

interface TransformDataOptions<T> extends ValidationOptions {
  data: string | (() => string),
  expected: T,
  matcher: Matcher<T>,
}

interface TransformerOptions<T> extends ValidationOptions {
  expected: T[],
  filePath: string,
  transformer: (dataRows: string[]) => T[],
}

function validateTransformData<T>({
  data, expected, matcher, tag,
}: TransformDataOptions<T>) {
  describe(`transformData: ${tag}`, () => {
    it('should return the transformed data', () => {
      const receivedData = transformData(
        typeof data === 'function' ? data() : data,
        matcher,
      );
      expect(receivedData).toStrictEqual(expected);
    });

    it('should return null if the data does not match', () => {
      const receivedData = transformData('lorem ipsum', matcher);
      expect(receivedData).toBeNull();
    });
  });
}

function validateTransformer<T>({
  expected, filePath, tag, transformer,
}: TransformerOptions<T>) {
  describe(`transform many: ${tag}`, () => {
    it('should return the transformed data', () => {
      const data = readFileSync(filePath, 'utf-8').split('\n');
      const regencies = transformer(data);

      expect(regencies).toStrictEqual(expected);
    });
  });
}

validateTransformData({
  tag: 'regency',
  matcher: new RegencyMatcher(),
  data: 'KAB. ACEH TENGGARA 16 4.179,1232 Luas Wilayah Definitif sesuai Surat Kapus PPBW BIG No. B-3.11/PBW-BIG/IGD.04.04/10/2022 Tanggal 3 Oktober 2022.11.02 227.9210 385',
  expected: { code: '1102', provinceCode: '11', name: 'KABUPATEN ACEH TENGGARA' },
});

validateTransformData({
  tag: 'district',
  matcher: new DistrictMatcher(),
  data: '11.01.04 Labuhanhaji 23 16 Perubahan nama Kec Labuhan Haji, sesuai Surat Gub. No. 140/5443 tgl',
  expected: { code: '110104', regencyCode: '1101', name: 'LABUHANHAJI' },
});

validateTransformer({
  tag: 'regencies',
  transformer: transformRegencies,
  filePath: path.resolve(__dirname, 'data/regencies.txt'),
  expected: [
    { code: '1102', provinceCode: '11', name: 'KABUPATEN ACEH TENGGARA' },
    { code: '1103', provinceCode: '11', name: 'KABUPATEN ACEH TIMUR' },
    { code: '1171', provinceCode: '11', name: 'KOTA BANDA ACEH' },
  ],
});

validateTransformer({
  tag: 'districts',
  transformer: transformDistricts,
  filePath: path.resolve(__dirname, 'data/districts.txt'),
  expected: [
    { code: '110101', regencyCode: '1101', name: 'BAKONGAN' },
    { code: '110102', regencyCode: '1101', name: 'KLUET UTARA' },
    { code: '110103', regencyCode: '1101', name: 'KLUET SELATAN' },
    { code: '110104', regencyCode: '1101', name: 'LABUHANHAJI' },
  ],
});
