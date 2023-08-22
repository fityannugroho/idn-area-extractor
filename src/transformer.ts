import {
  DistrictTransformed, IslandTransformed, RegencyTransformed, VillageTransformed,
} from 'idn-area-data';
import getDividerWords from './divider-words.js';
import DistrictMatcher from './matcher/DistrictMatcher.js';
import IslandMatcher from './matcher/IslandMatcher.js';
import RegencyMatcher from './matcher/RegencyMatcher.js';
import VillageMatcher from './matcher/VillageMatcher.js';
import { Matcher } from './matcher/index.js';

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

export function transformIslands(dataRows: string[]): IslandTransformed[] {
  return dataRows.map((row) => transformData(row, new IslandMatcher()))
    .filter((island): island is IslandTransformed => island !== null);
}

export function transformVillages(dataRows: string[]): VillageTransformed[] {
  const mergedRows: string[] = [];

  // Combine data spread across multiple rows.
  for (const row of dataRows) {
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

  return mergedRows.map((row) => transformData(row, new VillageMatcher()))
    .filter((village): village is VillageTransformed => village !== null);
}
