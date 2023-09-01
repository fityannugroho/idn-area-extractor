import path from 'path';
import { extractTxtFileRows } from './extractor.js';

interface DividerWordsOptions {
  withTypos?: boolean
  excludedWords?: readonly string[]
}

export default function getDividerWords(options?: DividerWordsOptions) {
  const words: string[] = [];
  const rows = extractTxtFileRows(path.resolve('data/divider-words.csv'), {
    trim: true,
    removeEmpty: true,
  });

  for (const row of rows) {
    const [word, ...typos] = row.split(',');

    if (options?.withTypos) {
      words.push(word, ...typos);
    } else {
      words.push(word);
    }

    if (options?.excludedWords) {
      for (const excludedWord of options.excludedWords) {
        if (words.includes(excludedWord)) {
          words.splice(words.indexOf(excludedWord), 1);
        }
      }
    }
  }

  return words;
}
