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
  visit(tree, (node, index, parent) => {
    if (!parent || typeof index !== "number") return;

    // Handle code blocks with language="math"
    if (node.type === "code" && "lang" in node && "value" in node) {
      const codeNode = node as { type: string; lang?: string | null; value: string };
      const language = typeof codeNode.lang === "string" ? codeNode.lang.toLowerCase() : undefined;

      if (language === "math" && typeof codeNode.value === "string") {
        const html = asMathHtml(codeNode.value, true);
        parent.children[index] = { type: "html", value: html } as unknown as typeof node;
        return;
      }
    }

    // Handle inline math and display math nodes
    if ((node.type === "inlineMath" || node.type === "math") && "value" in node) {
      const mathNode = node as { type: string; value: string };
      if (typeof mathNode.value === "string") {
        const html = asMathHtml(mathNode.value, mathNode.type === "math");
        parent.children[index] = { type: "html", value: html } as unknown as typeof node;
      }
    }
  });
};
