import type { APIRoute } from "astro";
import faqMarkdown from "../data/agent-pages/faq.md?raw";

export const GET: APIRoute = () => {
  return new Response(faqMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
