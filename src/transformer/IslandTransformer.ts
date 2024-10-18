import type { Island, IslandCsv } from 'idn-area-data';
import { regexMatcher } from '~/helpers.js';
import type { Transformer } from './index.js';

export default class IslandTransformer
  implements Transformer<Island, IslandCsv>
{
  /**
   *
   * The regex was tested in https://regex101.com/r/9A8GK2
   * @inheritdoc
   */
  getRegex(): RegExp {
    return /(\d{2}\.\d{2}\.4\d{4})\s(.+)\s([0-8][0-9]|90)°\s?([0-5][0-9]|60)'\s?([0-5][0-9]\.?[0-9]{0,2}|60\.00)""?\s(U|S)\s(0\d{2}|1(?:[0-7][0-9]|80))°\s?([0-5][0-9]|60)'\s?([0-5][0-9]\.?[0-9]{0,2}|60\.00)""?\s(B|T)\s*(\D*)/;
  }

  transform(data: string): Island | null {
    const match = regexMatcher(this.getRegex(), data);

    if (!match?.groups.length) {
      return null;
    }

    const [
      code,
      name,
      ltDeg,
      ltMin,
      ltSec,
      ltPole,
      lnDeg,
      lnMin,
      lnSec,
      lnPole,
      desc,
    ] = match.groups;
    const [provinceCode, regencyCode] = code.split('.');

    return {
      code,
      regencyCode: regencyCode === '00' ? '' : `${provinceCode}.${regencyCode}`,
      name,
      coordinate: `${ltDeg}°${ltMin}'${
        ltSec.includes('.') ? ltSec : `${ltSec}.00`
      }" ${ltPole.replace('U', 'N')} ${lnDeg}°${lnMin}'${
        lnSec.includes('.') ? lnSec : `${lnSec}.00`
      }" ${lnPole.replace('T', 'E').replace('B', 'W')}`,
      isPopulated: desc.search(/\bBP\b/) !== -1,
      isOutermostSmall: desc.search(/\bPPKT\b/) !== -1,
    };
  }

  transformMany(data: string[]): Island[] {
    return data
      .map((row) => this.transform(row))
      .filter((res): res is Island => res !== null)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  transformForCsv(data: Island[]): IslandCsv[] {
    return data.map((island) => ({
      code: island.code,
      regency_code: island.regencyCode ?? '',
      coordinate: island.coordinate,
      is_populated: island.isPopulated ? '1' : '0',
      is_outermost_small: island.isOutermostSmall ? '1' : '0',
      name: island.name,
    }));
  }
}
