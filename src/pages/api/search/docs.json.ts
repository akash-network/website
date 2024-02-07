import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

async function getAkashTools_PageContent() {
  const docs = await getCollection("Docs");

  return docs.map((content) => ({
    title: content.data.title,
    body: content.body,
    description: content.data.description || null,
    slug: content.slug,
  }));
}

export const GET: APIRoute = async ({ params, request }) => {
  return new Response(JSON.stringify(await getAkashTools_PageContent()), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
