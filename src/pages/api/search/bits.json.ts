import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

async function getBitsPageContent() {
  const posts = (await getCollection("Bits"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => {
      const dateA = new Date(a.data.pubDate);
      const dateB = new Date(b.data.pubDate);
      return dateB.getTime() - dateA.getTime();
    });

  return posts.map((content) => ({
    bannerImage: content.data.bannerImage ?? null,
    title: content.data.title,
    description: content.data.description,
    link: content.slug,
    pubDate: content.data.pubDate.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    author: content.data.author,
    tag: content.data.tags[0] ?? "",
  }));
}

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(await getBitsPageContent()), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
