import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractTxtFileRows } from '~/extractor.js';
import DistrictTransformer from '~/transformer/DistrictTransformer.js';
import IslandTransformer from '~/transformer/IslandTransformer.js';
import RegencyTransformer from '~/transformer/RegencyTransformer.js';
import VillageTransformer from '~/transformer/VillageTransformer.js';
import type { Transformer } from '~/transformer/index.js';

interface TransformerOptions<T> {
  tag: string;
  data: string[];
  expected: Required<T>[];
  transformer: Transformer<T>;
  reDoSTest: string;
}

function validateTransformer<T>({
  data,
  expected,
  reDoSTest,
  tag,
  transformer,
}: TransformerOptions<T>) {
  describe(`transform() ${tag}`, () => {
    it('should return null if the data does not match', () => {
      const receivedData = transformer.transform('lorem ipsum');
      expect(receivedData).toBeNull();
    });

    it('should handle ReDoS attack', () => {
      const receivedData = transformer.transform(reDoSTest);
      expect(receivedData).toBeNull();
    });
  });

  describe(`transformMany() ${tag}`, () => {
    it('should return an empty array if the data does not match', () => {
      const receivedData = transformer.transformMany([
        'lorem ipsum',
        'dolor sit amet',
      ]);
      expect(receivedData).toHaveLength(0);
    });

    it('should return the array of transformed data', () => {
      const results = transformer.transformMany(data);
      expect(results).toStrictEqual(expected);
    });
  });
}

validateTransformer({
  tag: 'regencies',
  transformer: new RegencyTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/regencies.txt')),
  expected: [
    { code: '11.02', provinceCode: '11', name: 'KABUPATEN ACEH TENGGARA' },
    { code: '11.03', provinceCode: '11', name: 'KABUPATEN ACEH TIMUR' },
    { code: '11.71', provinceCode: '11', name: 'KOTA BANDA ACEH' },
  ],
  reDoSTest: `KAB\tT${' A'.repeat(1000)}${'00.00 A'.repeat(1000)}\n`,
});

validateTransformer({
  tag: 'districts',
  transformer: new DistrictTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/districts.txt')),
  expected: [
    { code: '11.01.01', regencyCode: '11.01', name: 'Bakongan' },
    { code: '11.01.02', regencyCode: '11.01', name: 'Kluet Utara' },
    { code: '11.01.03', regencyCode: '11.01', name: 'Kluet Selatan' },
    { code: '11.01.04', regencyCode: '11.01', name: 'Labuhanhaji' },
  ],
  reDoSTest: `00.00.00\nh${'0\tqanun b'.repeat(18258)}\n`,
});

validateTransformer({
  tag: 'islands',
  transformer: new IslandTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/islands.txt')),
  expected: [
    {
      code: '11.01.40002',
      regencyCode: '11.01',
      coordinate: '03°24\'55.00" N 097°04\'21.00" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Batutunggal',
    },
    {
      code: '13.00.40001',
      regencyCode: '',
      coordinate: '00°45\'38.07" S 099°59\'47.69" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Bando',
    },
    {
      code: '21.71.40308',
      regencyCode: '21.71',
      coordinate: '00°47\'18.61" N 104°09\'01.32" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Petang',
    },
    {
      code: '21.71.40309',
      regencyCode: '21.71',
      coordinate: '00°37\'37.99" N 104°05\'28.00" E',
      isPopulated: true,
      isOutermostSmall: false,
      name: 'Pulau Petong',
    },
    {
      code: '21.71.40320',
      regencyCode: '21.71',
      coordinate: '01°04\'42.60" N 103°52\'24.10" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Punai',
    },
    {
      code: '52.01.40031',
      regencyCode: '52.01',
      coordinate: '08°53\'54.11" S 116°02\'58.02" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Gili Sarang Timur',
    },
    {
      code: '71.03.40118',
      regencyCode: '71.03',
      coordinate: '03°31\'33.49" N 125°39\'37.53" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Balontohe Besar',
    },
  ],
  reDoSTest: '98.26.48400\tB'.repeat(15192),
});

validateTransformer({
  tag: 'villages',
  transformer: new VillageTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/villages.txt')),
  expected: [
    { code: '11.01.01.2001', districtCode: '11.01.01', name: 'Keude Bakongan' },
    { code: '11.01.01.2002', districtCode: '11.01.01', name: 'Ujong Mangki' },
    { code: '11.01.01.2015', districtCode: '11.01.01', name: 'Darul Ikhsan' },
    {
      code: '11.11.05.2003',
      districtCode: '11.11.05',
      name: 'Matang Glumpang Dua Mns. Timu (X)',
    },
    { code: '11.14.02.2010', districtCode: '11.14.02', name: 'Datar Luas' },
    {
      code: '12.19.11.2003',
      districtCode: '12.19.11',
      name: 'Perkebunan Tanah Datar',
    },
    {
      code: '13.07.04.2001',
      districtCode: '13.07.04',
      name: 'Tj. Haro Sikabu-kabu Pd. Panjang',
    },
  ],
  reDoSTest: `00.00.00.0000\n${'\n'.repeat(54773)}`,
});
