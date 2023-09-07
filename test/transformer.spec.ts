import path from 'path';
import { describe, expect, it } from 'vitest';
import { extractTxtFileRows } from '~/extractor.js';
import DistrictTransformer from '~/transformer/DistrictTransformer.js';
import IslandTransformer from '~/transformer/IslandTransformer.js';
import RegencyTransformer from '~/transformer/RegencyTransformer.js';
import VillageTransformer from '~/transformer/VillageTransformer.js';
import { Transformer } from '~/transformer/index.js';

interface TransformerOptions<T> {
  tag: string,
  data: string[],
  expected: Required<T>[],
  transformer: Transformer<T>,
}

function validateTransformer<T>({
  data, expected, tag, transformer,
}: TransformerOptions<T>) {
  describe(`transform() ${tag}`, () => {
    it('should return null if the data does not match', () => {
      const receivedData = transformer.transform('lorem ipsum');
      expect(receivedData).toBeNull();
    });
  });

  describe(`transformMany() ${tag}`, () => {
    it('should return an empty array if the data does not match', () => {
      const receivedData = transformer.transformMany(['lorem ipsum', 'dolor sit amet']);
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
    { code: '1102', provinceCode: '11', name: 'KABUPATEN ACEH TENGGARA' },
    { code: '1103', provinceCode: '11', name: 'KABUPATEN ACEH TIMUR' },
    { code: '1171', provinceCode: '11', name: 'KOTA BANDA ACEH' },
  ],
});

validateTransformer({
  tag: 'districts',
  transformer: new DistrictTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/districts.txt')),
  expected: [
    { code: '110101', regencyCode: '1101', name: 'BAKONGAN' },
    { code: '110102', regencyCode: '1101', name: 'KLUET UTARA' },
    { code: '110103', regencyCode: '1101', name: 'KLUET SELATAN' },
    { code: '110104', regencyCode: '1101', name: 'LABUHANHAJI' },
  ],
});

validateTransformer({
  tag: 'islands',
  transformer: new IslandTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/islands.txt')),
  expected: [
    {
      code: '110140002',
      regencyCode: '1101',
      coordinate: '03°24\'55.00" N 097°04\'21.00" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Batutunggal',
    },
    {
      code: '130040001',
      regencyCode: '',
      coordinate: '00°45\'38.07" S 099°59\'47.69" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Bando',
    },
    {
      code: '217140308',
      regencyCode: '2171',
      coordinate: '00°47\'18.61" N 104°09\'01.32" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Petang',
    },
    {
      code: '217140309',
      regencyCode: '2171',
      coordinate: '00°37\'37.99" N 104°05\'28.00" E',
      isPopulated: true,
      isOutermostSmall: false,
      name: 'Pulau Petong',
    },
    {
      code: '217140320',
      regencyCode: '2171',
      coordinate: '01°04\'42.60" N 103°52\'24.10" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Punai',
    },
    {
      code: '520140031',
      regencyCode: '5201',
      coordinate: '08°53\'54.11" S 116°02\'58.02" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Gili Sarang Timur',
    },
    {
      code: '710340118',
      regencyCode: '7103',
      coordinate: '03°31\'33.49" N 125°39\'37.53" E',
      isPopulated: false,
      isOutermostSmall: false,
      name: 'Pulau Balontohe Besar',
    },
  ],
});

validateTransformer({
  tag: 'villages',
  transformer: new VillageTransformer(),
  data: extractTxtFileRows(path.resolve(__dirname, 'data/villages.txt')),
  expected: [
    { code: '1101012001', districtCode: '110101', name: 'KEUDE BAKONGAN' },
    { code: '1101012002', districtCode: '110101', name: 'UJONG MANGKI' },
    { code: '1101012015', districtCode: '110101', name: 'DARUL IKHSAN' },
    { code: '1111052003', districtCode: '111105', name: 'MATANG GLUMPANG DUA MNS. TIMU (X)' },
    { code: '1114022010', districtCode: '111402', name: 'DATAR LUAS' },
    { code: '1219112003', districtCode: '121911', name: 'PERKEBUNAN TANAH DATAR' },
    { code: '1307042001', districtCode: '130704', name: 'TJ. HARO SIKABU-KABU PD. PANJANG' },
  ],
});
