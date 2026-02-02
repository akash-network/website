/**
 * Unified AST node types for markdown processing
 * Based on unist (Universal Syntax Tree) specification
 */

/**
 * Base node interface from unist
 */
export interface UnistNode {
  type: string;
  data?: Record<string, unknown>;
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
}

/**
 * Parent node that can contain children
 */
export interface UnistParent extends UnistNode {
  children: UnistNode[];
}

/**
 * Code node from mdast
 */
export interface CodeNode extends UnistNode {
  type: "code";
  lang?: string | null;
  value: string;
  meta?: string | null;
}

/**
 * Math node (inline math)
 */
export interface InlineMathNode extends UnistNode {
  type: "inlineMath";
  value: string;
}

/**
 * Math node (display math)
 */
export interface MathNode extends UnistNode {
  type: "math";
  value: string;
}

/**
 * HTML node
 */
export interface HtmlNode extends UnistNode {
  type: "html";
  value: string;
}

/**
 * Union type for all possible markdown nodes
 */
export type MarkdownNode = UnistNode | CodeNode | InlineMathNode | MathNode | HtmlNode;
