import { Regency, RegencyCsv } from 'idn-area-data';
import { Transformer } from './index.js';

export default class RegencyTransformer implements Transformer<Regency, RegencyCsv> {
  /**
   *
   * The regex was tested in https://regex101.com/r/J63CVl
   * @inheritdoc
   */
  getRegex(): RegExp {
    return /^((?:KAB\.?|KOTA)\s[A-Z\\. ]+)\s.+(\d{2}\.\d{2})\s.+$/i;
  }

  prepareData(data: string[]): string[] {
    const mergedRows: string[] = [];

    for (const row of data) {
      // The regex was tested in https://regex101.com/r/l1PJvE
      const regencyCodeRegex = /^((?:KAB\.?|KOTA)\s[A-Z. ]+)\s/i;

      if (row.match(regencyCodeRegex)) {
        mergedRows.push(row);
      } else {
        const lastRow = mergedRows.pop();

        if (lastRow) {
          mergedRows.push(`${lastRow} ${row}`);
        }
      }
    }

    return mergedRows;
  }

  transform(data: string): Regency | null {
    const match = data.match(this.getRegex());

    if (!match?.length) {
      return null;
    }

    const [, name, code] = match;
    const [provinceCode] = code.split('.');

    return {
      code,
      provinceCode,
      name: name.replace(/KAB(?:\.?)\s/, 'KABUPATEN '),
    };
  }

  transformMany(data: string[]): Regency[] {
    return this.prepareData(data)
      .map((row) => this.transform(row))
      .filter((res): res is Regency => res !== null)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  transformForCsv(data: Regency[]): RegencyCsv[] {
    return data.map((regency) => ({
      code: regency.code,
      province_code: regency.provinceCode,
      name: regency.name,
    }));
  }
}
