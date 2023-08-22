import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  transformData, transformDistricts, transformIslands, transformRegencies,
} from '~/transformer.js';
import { Matcher } from '~/matcher/index.js';
import RegencyMatcher from '~/matcher/RegencyMatcher.js';
import DistrictMatcher from '~/matcher/DistrictMatcher.js';
import IslandMatcher from '~/matcher/IslandMatcher.js';

interface ValidationOptions {
  tag: string,
}

interface TransformDataOptions<T> extends ValidationOptions {
  data: string | (() => string),
  expected: T,
  matcher: Matcher<T>,
}

interface TransformerOptions<T> extends ValidationOptions {
  expected: Required<T>[],
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

validateTransformData({
  tag: 'island',
  matcher: new IslandMatcher(),
  data: '21.71.40322 Pulau Putri 01°12\'15.00" U 104°04\'41.00" T TBP(PPKT)',
  expected: {
    code: '217140322', regencyCode: '2171', coordinate: '01°12\'15.00" N 104°04\'41.00" E', isPopulated: false, isOutermostSmall: true, name: 'Pulau Putri',
  },
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

validateTransformer({
  tag: 'islands',
  transformer: transformIslands,
  filePath: path.resolve(__dirname, 'data/islands.txt'),
  expected: [
    {
      code: '130040001', regencyCode: '', coordinate: '00°45\'38.07" S 099°59\'47.69" E', isPopulated: false, isOutermostSmall: false, name: 'Pulau Bando',
    },
    {
      code: '217140308', regencyCode: '2171', coordinate: '00°47\'18.61" N 104°09\'01.32" E', isPopulated: false, isOutermostSmall: false, name: 'Pulau Petang',
    },
    {
      code: '217140309', regencyCode: '2171', coordinate: '00°37\'37.99" N 104°05\'28.00" E', isPopulated: true, isOutermostSmall: false, name: 'Pulau Petong',
    },
    {
      code: '217140320', regencyCode: '2171', coordinate: '01°04\'42.60" N 103°52\'24.10" E', isPopulated: false, isOutermostSmall: false, name: 'Pulau Punai',
    },
  ],
});
