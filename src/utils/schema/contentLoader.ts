import { glob } from "astro/loaders";

/**
 * Shared glob loader for the project's Markdown content collections.
 *
 * Replicates the Astro v4 underscore convention that the Content Layer API no
 * longer applies automatically: files and folders whose name starts with "_"
 * (e.g. `About_Page/_pricing`, `Community_Page/_community-contributions`) are
 * excluded from collection entries.
 *
 * @param folder Folder name under `src/content` (e.g. "Docs", "Blog").
 */
export function contentLoader(folder: string) {
  return glob({
    pattern: ["**/[^_]*.{md,mdx}", "!**/_*/**"],
    base: `./src/content/${folder}`,
  });
}
