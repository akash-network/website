import type { RemarkPlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";
 import type { Node, Parent } from "unist";

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

interface CodeNode extends Node {
  type: "code";
  lang?: string;
  value?: string;
}

interface MathNode extends Node {
  type: "inlineMath" | "math";
  value?: string;
}

type MathNodeType = CodeNode | MathNode;

export const normalizeMath: RemarkPlugin<[]> = () => (tree) => {
  visit(tree, (node: Node, index: number | undefined, parent: Parent | null | undefined) => {
    if (!parent || typeof index !== "number") return;

    // Handle code blocks with math language
    if (node.type === "code") {
      const codeNode = node as CodeNode;
      const language = typeof codeNode.lang === "string" ? codeNode.lang.toLowerCase() : undefined;
      if (typeof codeNode.value === "string" && language === "math") {
        const html = asMathHtml(codeNode.value, true);
        parent.children[index] = { type: "html", value: html } as Node;
        return;
      }
    }

    // Handle inline math and math nodes
    if (node.type === "inlineMath" || node.type === "math") {
      const mathNode = node as MathNode;
      if (typeof mathNode.value === "string") {
        const html = asMathHtml(mathNode.value, node.type === "math");
        parent.children[index] = { type: "html", value: html } as Node;
      }
    }
  });
};
