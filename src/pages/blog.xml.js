import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
export async function GET(context) {
  const blog = await getCollection("Blog");
  return rss({
    title: "Akash Network Blog",
    description:
      "Stay updated with the latest trends, news, and insights in decentralized cloud computing. Explore thought leadership, technical deep-dives, and community highlights.",
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
