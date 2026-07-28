import type { APIRoute } from "astro";

const robotsTxt = `
# AI Search & Citation Bots — block these = disappear from AI answers
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

# AI Training Bots — feeds model knowledge of Akash
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

# Block low-value scrapers
User-agent: Bytespider
Disallow: /

# Standard crawlers
User-agent: *
Allow: /

Sitemap: ${new URL("sitemap-0.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
