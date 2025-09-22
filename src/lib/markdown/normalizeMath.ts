import type { RemarkPlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";

const stripBalancedTicks = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return { cleaned: "", stripped: false };
  }

  const leading = trimmed.match(/^`+/)?.[0].length ?? 0;
  const trailing = trimmed.match(/`+$/)?.[0].length ?? 0;
  const remove = leading && trailing ? Math.min(leading, trailing) : 0;

  if (!remove) {
    return { cleaned: trimmed, stripped: false };
  }

  const sliced = trimmed.slice(remove, trimmed.length - remove).trim();
  return { cleaned: sliced, stripped: true };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const normalizeMath: RemarkPlugin<[]> = () => (tree) => {
  visit(tree, ["inlineMath", "math"], (node: any, index: number | null, parent: any) => {
    if (!parent || typeof index !== "number" || typeof node.value !== "string") return;

    const { cleaned, stripped } = stripBalancedTicks(node.value);

    if (!cleaned) {
      parent.children[index] = { type: "html", value: "" };
      return;
    }

    const normalized = stripped ? cleaned.replace(/\\{2}/g, "\\") : cleaned;
    const escaped = escapeHtml(normalized);

    const html =
      node.type === "math"
        ? `<div class="math-display">\\[${escaped}\\]</div>`
        : `<span class="math-inline">\\(${escaped}\\)</span>`;

    parent.children[index] = { type: "html", value: html };
  });
};
