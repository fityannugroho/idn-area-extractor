import { DistrictTransformed } from 'idn-area-data';
import getDividerWords from '~/divider-words.js';
import { Matcher } from './index.js';

export default class DistrictMatcher implements Matcher<DistrictTransformed> {
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

  transform(match: RegExpMatchArray): DistrictTransformed {
    const code = match[1].replace(/\./g, '');

    return {
      code,
      regencyCode: code.substring(0, 4),
      name: match[2].toUpperCase(),
    };
  }
}
