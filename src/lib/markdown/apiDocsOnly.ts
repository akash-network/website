import type { Plugin } from "unified";

const API_DOCS_PATH_FRAGMENT = "/content/Docs/api-documentation/";

export function apiDocsOnly<P extends Plugin<any[], any, any>>(plugin: P): P {
  const wrapped = function (this: unknown, ...args: any[]) {
    const transformer = (plugin as any).apply(this, args);
    if (typeof transformer !== "function") return transformer;
    return function (tree: any, file: any) {
      const path = String(file?.history?.[0] ?? file?.path ?? "").replace(/\\/g, "/");
      if (!path.includes(API_DOCS_PATH_FRAGMENT)) return;
      return transformer(tree, file);
    };
  };
  return wrapped as unknown as P;
}
