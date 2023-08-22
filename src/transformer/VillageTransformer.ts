import { VillageTransformed } from 'idn-area-data';
import getDividerWords from '~/divider-words.js';
import { Transformer } from './index.js';

export default class VillageTransformer implements Transformer<VillageTransformed> {
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

  prepareData(data: string[]) {
    const mergedRows: string[] = [];

    // Combine data spread across multiple rows.
    for (const row of data) {
      // The regex was tested in https://regex101.com/r/FfdNRZ/8
      const dws = getDividerWords({ withTypos: true }).join('|');
      const villageNameRegex = new RegExp(`^(?!(?:${dws})\\b)([a-z.'()/\\- ]+?)$`, 'i');

      if (row.match(villageNameRegex)) {
        const lastRow = mergedRows.pop();

        if (lastRow) {
          mergedRows.push(`${lastRow} ${row}`);
        }
      } else {
        mergedRows.push(row);
      }
    }

    return mergedRows;
  }

  transform(data: string): VillageTransformed | null {
    const match = data.match(this.getRegex());

    if (!match?.length) {
      return null;
    }

    const code = match[1].replace(/\./g, '');

    return {
      code,
      districtCode: code.substring(0, 6),
      // The regex was tested in https://regex101.com/r/RX8JCD
      name: match[2].replace(/(?<!\s|\d)(\d+?)$/, '').toUpperCase(),
    };
  }

  transformMany(data: string[]): VillageTransformed[] {
    return this.prepareData(data)
      .map((row) => this.transform(row))
      .filter((res): res is VillageTransformed => res !== null);
  }
}
