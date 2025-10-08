import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

async function getDeployedOnAkashContent() {
  const projects = (await getCollection("Ecosystem_Page"))
    .filter((project) => project.data.showcase === true)
    .sort((a, b) => {
      const dateA = new Date(a.data.pubDate);
      const dateB = new Date(b.data.pubDate);

      return dateB.getTime() - dateA.getTime();
    });

  return projects.map((content) => ({
    projectImage: content.data.projectImage,
    projectTitle: content.data.projectTitle,
    projectDescription: content.data.description,
    projectLink: content?.data.ctaButton?.link,
    pubDate: content.data.pubDate,
    githubLink: content.data.githubLink,
    twitterLink: content.data.twitterLink,
    discordLink: content.data.discordLink,
  }));
}

export const GET: APIRoute = async ({ params, request }) => {
  return new Response(JSON.stringify(await getDeployedOnAkashContent()), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
