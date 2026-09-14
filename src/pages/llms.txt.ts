import type { APIRoute } from "astro";
import llmsTxt from "../data/agent-pages/llms.txt?raw";

export const GET: APIRoute = () => {
  return new Response(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
