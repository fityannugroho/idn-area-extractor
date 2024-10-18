import { firstMatch } from 'super-regex';

/**
 * The default timeout for regex matcher in milliseconds.
 */
export const DEFAULT_REGEX_MATCHER_TIMEOUT = 500;

/**
 * Returns the first match or `undefined` if there was no match.
 *
 * If the regex takes longer to match than the given timeout, it returns undefined.
 *
 * The default timeout is 500ms.
 */
export function regexMatcher(regex: RegExp, str: string, timeout?: number) {
  return firstMatch(regex, str, {
    timeout: timeout ?? DEFAULT_REGEX_MATCHER_TIMEOUT,
  });
}
