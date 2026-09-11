const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const stylesheet = `
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    padding: 3rem 1.25rem 5rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background: #fff;
  }
  main {
    max-width: 44rem;
    margin: 0 auto;
  }
  h1, h2, h3, h4 { line-height: 1.25; margin-top: 2.25rem; }
  h1 { font-size: 2rem; margin-top: 0; }
  h2 { font-size: 1.375rem; }
  h3 { font-size: 1.125rem; }
  p, ul, ol, pre, blockquote { margin: 1rem 0; }
  a { color: #ff424c; }
  a:hover { text-decoration: underline; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background: rgba(0, 0, 0, 0.06);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 1rem 1.125rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-size: 0.875rem;
  }
  pre code { background: transparent; padding: 0; color: inherit; }
  blockquote {
    border-left: 3px solid #ff424c;
    padding: 0.25rem 0 0.25rem 1rem;
    color: #444;
    background: rgba(255, 66, 76, 0.05);
  }
  hr { border: 0; border-top: 1px solid #e5e5e5; margin: 2rem 0; }
  @media (prefers-color-scheme: dark) {
    body { color: #e5e5e5; background: #0a0a0a; }
    code { background: rgba(255, 255, 255, 0.08); }
    blockquote { color: #bbb; background: rgba(255, 66, 76, 0.08); }
    hr { border-top-color: #262626; }
  }
`;

export const renderAgentPage = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="/favicon.ico" />
    <style>${stylesheet}</style>
  </head>
  <body>
    <main>${content}</main>
  </body>
</html>
`;
