import { IslandTransformed } from 'idn-area-data';
import { Matcher } from './index.js';

export default class IslandMatcher implements Matcher<IslandTransformed> {
  /**
   *
   * The regex was tested in https://regex101.com/r/9A8GK2
   * @inheritdoc
   */
  getRegex(): RegExp {
    return /(\d{2}.\d{2}.4\d{4})\s(.+)\s((?:[0-8][0-9]|90)°(?:[0-5][0-9]|60)'(?:[0-5][0-9].?[0-9]{0,2}|60.00)"\s[U|S]\s(?:0\d{2}|1(?:[0-7][0-9]|80))°(?:[0-5][0-9]|60)'(?:[0-5][0-9].?[0-9]{0,2}|60.00)"\s[B|T])\s*(\D*)/;
  }

  transform(match: RegExpMatchArray): IslandTransformed {
    const code = match[1].replace(/\./g, '');

    return {
      code,
      regencyCode: code.substring(2, 4) === '00' ? '' : code.substring(0, 4),
      name: match[2],
      coordinate: match[3].replace('U', 'N').replace('T', 'E').replace('B', 'W'),
      isPopulated: match[4].search(/\bBP\b/) !== -1,
      isOutermostSmall: match[4].search(/\bPPKT\b/) !== -1,
    };
  }
}
