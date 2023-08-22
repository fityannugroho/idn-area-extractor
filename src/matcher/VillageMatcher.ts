import { VillageTransformed } from 'idn-area-data';
import { Matcher } from './index.js';
import getDividerWords from '~/divider-words.js';

export default class VillageMatcher implements Matcher<VillageTransformed> {
  /**
   *
   * The regex was tested in https://regex101.com/r/yySCn0/9
   * @inheritdoc
   */
  getRegex(): RegExp {
    const dws = getDividerWords({ withTypos: true }).join('|');

    return new RegExp(
      `^(\\d{2}\\.\\d{2}\\.\\d{2}\\.\\d{4})\\s*\\d*\\s*(.+?)(?=$|\\s(?:${dws})\\b)`,
      'i',
    );
  }

  transform(match: RegExpMatchArray): VillageTransformed {
    const code = match[1].replace(/\./g, '');

    return {
      code,
      districtCode: code.substring(0, 6),
      // The regex was tested in https://regex101.com/r/RX8JCD
      name: match[2].replace(/(?<!\s|\d)(\d+?)$/, '').toUpperCase(),
    };
  }
}
