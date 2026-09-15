import type { APIRoute } from "astro";
import { marked } from "marked";
import faqMarkdown from "../data/agent-pages/faq.md?raw";
import { renderAgentPage } from "../lib/agent-pages/renderAgentPage";

export const GET: APIRoute = () => {
  const body = renderAgentPage({
    title: "Akash Network FAQ",
    content: marked.parse(faqMarkdown, { async: false }) as string,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};
