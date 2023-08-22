import { DistrictTransformed } from 'idn-area-data';
import getDividerWords from '~/divider-words.js';
import { Transformer } from './index.js';

export default class DistrictTransformer implements Transformer<DistrictTransformed> {
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

  transform(data: string): DistrictTransformed | null {
    const match = data.match(this.getRegex());

    if (!match?.length) {
      return null;
    }

    const code = match[1].replace(/\./g, '');

    return {
      code,
      regencyCode: code.substring(0, 4),
      name: match[2].toUpperCase(),
    };
  }

  transformMany(data: string[]): DistrictTransformed[] {
    return data
      .map((row) => this.transform(row))
      .filter((res): res is DistrictTransformed => res !== null);
  }
}
