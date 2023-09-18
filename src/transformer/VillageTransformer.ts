import { VillageTransformed as Village, Village as VillageCsv } from 'idn-area-data';
import getDividerWords from '~/divider-words.js';
import { Transformer } from './index.js';

export default class VillageTransformer implements Transformer<Village, VillageCsv> {
  getDividerWords() {
    return getDividerWords({
      withTypos: true,
      excludedWords: [
        'data', 'desa', 'PP', 'pindah', 'undang',
      ],
    });
  }

  /**
   *
   * The regex was tested in https://regex101.com/r/yySCn0/9
   * @inheritdoc
   */
  getRegex(): RegExp {
    const dws = this.getDividerWords().join('|');

    return new RegExp(
      `^(\\d{2}\\.\\d{2}\\.\\d{2}\\.\\d{4})\\s*\\d*\\s*(.+?)(?=$|\\s(?:${dws})\\b)`,
      'i',
    );
  }

  prepareData(data: string[]) {
    // The regex was tested in https://regex101.com/r/FfdNRZ/8
    const dws = this.getDividerWords().join('|');
    const villageNameRegex = new RegExp(`^(?!(?:${dws})\\b)([a-z.'()/\\- ]+?)$`, 'i');
    const mergedRows: string[] = [];
    const colSize = 26;

    // Combine data spread across multiple rows.
    for (const row of data) {
      // The current row is most likely the rest of latest village name
      // if the current row length <= column size
      if (row.match(villageNameRegex) && row.length <= colSize) {
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

  transform(data: string): Village | null {
    const match = data.match(this.getRegex());

    if (!match?.length) {
      return null;
    }

    const [, code, name] = match;
    const [provinceCode, regencyCode, districtCode] = code.split('.');

    return {
      code,
      districtCode: `${provinceCode}.${regencyCode}.${districtCode}`,
      // The regex was tested in https://regex101.com/r/RX8JCD
      name: name.replace(/(?<!\s|\d)(\d+?)$/, ''),
    };
  }

  transformMany(data: string[]): Village[] {
    return this.prepareData(data)
      .map((row) => this.transform(row))
      .filter((res): res is Village => res !== null)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  transformForCsv(data: Village[]): VillageCsv[] {
    return data.map((village) => ({
      code: village.code,
      district_code: village.districtCode,
      name: village.name,
    }));
  }
}
