import { describe, expect, test } from 'vitest';
import getDividerWords from '~/divider-words.js';

describe('dividerWords', () => {
  const typoWords = ['pemebntukan', 'pemakaran'];

  test('default (without typos)', () => {
    const words = getDividerWords();
    expect(words).toStrictEqual(expect.not.arrayContaining(typoWords));
  });

  test('with typos', () => {
    const words = getDividerWords({ withTypos: true });
    expect(words).toStrictEqual(expect.arrayContaining(typoWords));
  });

  test('with excluded words', () => {
    const words = getDividerWords({ excludedWords: ['pembentukan'] });
    expect(words).toStrictEqual(expect.not.arrayContaining(['pembentukan']));
  });
});
