import { DistrictTransformed, RegencyTransformed } from 'idn-area-data';
import { Matcher } from './matcher/index.js';
import RegencyMatcher from './matcher/RegencyMatcher.js';
import DistrictMatcher from './matcher/DistrictMatcher.js';

export function transformData<T>(
  data: string,
  matcher: Matcher<T>,
): T | null {
  const match = data.match(matcher.getRegex());

  if (!match?.length) {
    return null;
  }

  return matcher.transform(match);
}

export function transformRegencies(dataRows: string[]): RegencyTransformed[] {
  const mergedRows: string[] = [];

  // Combine data spread across multiple rows.
  for (const row of dataRows) {
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

  return mergedRows.map((row) => transformData(row, new RegencyMatcher()))
    .filter((regency): regency is RegencyTransformed => regency !== null);
}

export function transformDistricts(dataRows: string[]): DistrictTransformed[] {
  return dataRows.map((row) => transformData(row, new DistrictMatcher()))
    .filter((district): district is DistrictTransformed => district !== null);
}
