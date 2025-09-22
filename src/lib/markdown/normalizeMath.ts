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

const normalizeValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const { cleaned } = stripBalancedTicks(trimmed);
  return cleaned.replace(/\\\\(?=\S)/g, "\\");
};

const asMathHtml = (value: string, display: boolean) => {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return "";
  }

  const escaped = escapeHtml(normalized);

  return display
    ? `<div class="math-display">\\[${escaped}\\]</div>`
    : `<span class="math-inline">\\(${escaped}\\)</span>`;
};

export const normalizeMath: RemarkPlugin<[]> = () => (tree) => {
  visit(tree, (node: any, index: number | null, parent: any) => {
    if (!parent || typeof index !== "number") return;

    const language = typeof node.lang === "string" ? node.lang.toLowerCase() : undefined;

    if (node.type === "code" && typeof node.value === "string" && language === "math") {
      const html = asMathHtml(node.value, true);
      parent.children[index] = { type: "html", value: html };
      return;
    }

    if ((node.type !== "inlineMath" && node.type !== "math") || typeof node.value !== "string") {
      return;
    }

    const html = asMathHtml(node.value, node.type === "math");
    parent.children[index] = { type: "html", value: html };
  });
};
