import type { APIRoute } from "astro";
import getStartedMarkdown from "../data/agent-pages/get-started.md?raw";

export const GET: APIRoute = () => {
  return new Response(getStartedMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
