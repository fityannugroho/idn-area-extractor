import { RegencyTransformed } from 'idn-area-data';
import { Matcher } from './index.js';

export default class RegencyMatcher implements Matcher<RegencyTransformed> {
  /**
  *
  * The regex was tested in https://regex101.com/r/J63CVl
  * @inheritdoc
  */
  getRegex() {
    return /^((?:KAB\.?|KOTA)\s[A-Z\\. ]+)\s.+(\d{2}\.\d{2})\s.+$/i;
  }

  transform(match: RegExpMatchArray): RegencyTransformed {
    const code = match[2].replace(/\./g, '');

    return {
      code,
      provinceCode: code.substring(0, 2),
      name: match[1].replace(/KAB(?:\.?)\s/, 'KABUPATEN '),
    };
  }
}
