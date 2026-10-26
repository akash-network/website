const WORDS_PER_MINUTE = 230;

/**
 * Estimated reading time, in whole minutes, of a Markdown/MDX entry body
 * (`entry.body` from a glob-loaded content collection).
 *
 * Counts the words a reader sees: MDX import/export lines, HTML/JSX tags,
 * images and URLs are dropped, links keep their text, and code blocks are
 * counted like prose. Returns undefined for an empty body (e.g. entries that
 * only link to external content), so callers can hide the label.
 */
export const getReadingTime = (body?: string): number | undefined => {
  if (!body) return undefined;

  const text = body
    .replace(/^\s*(import|export)\s.*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ");

  const words = text
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

  return words > 0 ? Math.ceil(words / WORDS_PER_MINUTE) : undefined;
};
