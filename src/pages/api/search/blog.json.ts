import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

async function getBlogPageContent() {
  const blogs = (await getCollection("Blog")).sort((a, b) => {
    const dateA = new Date(a.data.pubDate);
    const dateB = new Date(b.data.pubDate);

    return dateB.getTime() - dateA.getTime();
  });

  return blogs.map((content) => ({
    bannerImage: content.data.bannerImage,
    title: content.data.title,
    description: content.data.description,
    link: content.slug,
    pubDate: content.data.pubDate.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    contributor: content.data.contributors?.[0] || null,
    tag: content.data.tags?.[0] || null,
  }));
}

export const GET: APIRoute = async ({ params, request }) => {
  return new Response(JSON.stringify(await getBlogPageContent()), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
