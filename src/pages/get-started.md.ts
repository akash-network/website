import type { APIRoute } from "astro";
import { marked } from "marked";
import getStartedMarkdown from "../data/agent-pages/get-started.md?raw";
import { renderAgentPage } from "../lib/agent-pages/renderAgentPage";

const stripFrontmatter = (markdown: string) =>
  markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");

export const GET: APIRoute = () => {
  const body = renderAgentPage({
    title: "Onboard your agent to Akash Network",
    content: marked.parse(stripFrontmatter(getStartedMarkdown), {
      async: false,
    }) as string,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};
