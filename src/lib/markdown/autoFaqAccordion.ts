import type { RemarkPlugin } from "@astrojs/markdown-remark";

/**
 * Auto-converts plain "**Question?** Answer." paragraphs under an "FAQ"
 * heading into native <details>/<summary> accordions — no raw HTML needed
 * in content files. Opt in per post with frontmatter:
 *
 *   ---
 *   faqAccordion: true
 *   ---
 *
 *   ## FAQ
 *
 *   **Question one?** Answer text, can include [links](/foo) and **bold**.
 *
 *   **Question two?** Another answer.
 *
 * Opt-in (rather than applying to every post automatically) so existing
 * posts that already have a plain-text FAQ keep rendering exactly as
 * written, unaffected by this plugin, unless they explicitly ask for it.
 *
 * Only paragraphs whose first child is a bold run are transformed, and only
 * within an "FAQ" section (a depth-2 heading whose text is exactly "FAQ",
 * up to the next heading of depth <= 2), so this never touches bold text
 * elsewhere in a post.
 */

const PLUS_ICON =
  '<span class="shrink-0 text-xl leading-none text-foreground/60 transition-transform duration-200 group-open:rotate-45">+</span>';

const DETAILS_CLASS =
  "group rounded-lg border border-defaultBorder bg-badgeColor/40 p-5 open:bg-badgeColor/60";
const SUMMARY_CLASS =
  "flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden";
const ANSWER_CLASS = "mt-3 text-sm text-darkText md:text-base";

const isFaqHeading = (node: any) =>
  node?.type === "heading" &&
  node.depth === 2 &&
  node.children?.length === 1 &&
  node.children[0]?.type === "text" &&
  ["faq", "faqs"].includes(node.children[0]?.value?.trim().toLowerCase());

const isQuestionParagraph = (node: any) =>
  node?.type === "paragraph" &&
  node.children?.length > 0 &&
  node.children[0]?.type === "strong";

export const autoFaqAccordion: RemarkPlugin<[]> = () => (tree: any, file: any) => {
  if (!file?.data?.astro?.frontmatter?.faqAccordion) return;

  const root = tree.children as any[];

  for (let i = 0; i < root.length; i++) {
    if (!isFaqHeading(root[i])) continue;

    // Find the extent of this FAQ section: everything up to the next
    // depth-<=2 heading (or end of document).
    let end = i + 1;
    while (
      end < root.length &&
      !(root[end].type === "heading" && root[end].depth <= 2)
    ) {
      end++;
    }

    // Group into contiguous runs of question paragraphs, so any interstitial
    // non-FAQ content (rare, but don't assume it can't happen) stays put
    // instead of being silently dropped.
    const runs: Array<[number, number]> = [];
    let runStart = -1;
    for (let j = i + 1; j <= end; j++) {
      const isQuestion = j < end && isQuestionParagraph(root[j]);
      if (isQuestion && runStart === -1) runStart = j;
      if (!isQuestion && runStart !== -1) {
        runs.push([runStart, j - 1]);
        runStart = -1;
      }
    }
    if (!runs.length) continue;

    // Apply from the last run backwards so earlier indices stay valid as
    // each run collapses from N nodes down to 1 wrapper node.
    for (let r = runs.length - 1; r >= 0; r--) {
      const [start, stop] = runs[r];
      const items = root.slice(start, stop + 1);

      for (const node of items) {
        const [question, ...answer] = node.children;
        if (answer[0]?.type === "text") {
          answer[0] = { ...answer[0], value: answer[0].value.replace(/^\s+/, "") };
        }

        node.data = {
          hName: "details",
          hProperties: { className: DETAILS_CLASS.split(" ") },
        };
        node.children = [
          {
            type: "paragraph",
            data: {
              hName: "summary",
              hProperties: { className: SUMMARY_CLASS.split(" ") },
            },
            children: [
              {
                type: "paragraph",
                data: { hName: "span", hProperties: {} },
                children: question.children,
              },
              { type: "html", value: PLUS_ICON },
            ],
          },
          {
            type: "paragraph",
            data: { hProperties: { className: ANSWER_CLASS.split(" ") } },
            children: answer,
          },
        ];
      }

      // Wrap the run so spacing between items matches the hand-written
      // version (space-y-3).
      const wrapper = {
        type: "paragraph",
        data: {
          hName: "div",
          hProperties: { className: ["not-prose", "my-10", "space-y-3"] },
        },
        children: items,
      };

      root.splice(start, stop - start + 1, wrapper);
    }
  }
};
