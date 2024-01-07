import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

async function getCommunityContributionsContent() {
  const projects = (await getCollection("Community_Contributions_Page")).sort(
    (a, b) => {
      const dateA = new Date(a.data.pubDate);
      const dateB = new Date(b.data.pubDate);

      return dateB.getTime() - dateA.getTime();
    },
  );

  return projects.map((content) => ({
    title: content.data.title,
    pubDate: content.data.pubDate.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    tags: content.data.tags,
    projectImage: content.data.image,
    projectDescription: content.data.description,
    author: content.data.author,
  }));
}

export const GET: APIRoute = async ({ params, request }) => {
  return new Response(
    JSON.stringify(await getCommunityContributionsContent()),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
