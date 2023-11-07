import { District, DistrictCsv } from 'idn-area-data';
import getDividerWords from '~/divider-words.js';
import { regexMatcher } from '~/helpers.js';
import { Transformer } from './index.js';

export default class DistrictTransformer implements Transformer<District, DistrictCsv> {
  /**
   *
   * The regex was tested in https://regex101.com/r/QDaT7Z
   * @inheritdoc
   */
  getRegex(): RegExp {
    const dws = getDividerWords({
      withTypos: true,
      excludedWords: ['desa', 'nagari'],
    }).join('|');

    return new RegExp(
      `^(\\d{2}\\.\\d{2}\\.\\d{2})\\s(.+?)\\s?[\\d. ]*(?=$|\\s(?:${dws})\\b.*$)`,
      'i',
    );
  }

  transform(data: string): District | null {
    const match = regexMatcher(this.getRegex(), data);

    if (!match?.groups.length) {
      return null;
    }

    const [code, name] = match.groups;
    const [provinceCode, regencyCode] = code.split('.');

    return {
      code,
      regencyCode: `${provinceCode}.${regencyCode}`,
      name,
    };
  }

  transformMany(data: string[]): District[] {
    return data
      .map((row) => this.transform(row))
      .filter((res): res is District => res !== null)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  transformForCsv(data: District[]): DistrictCsv[] {
    return data.map((district) => ({
      code: district.code,
      regency_code: district.regencyCode,
      name: district.name,
    }));
  }
}
