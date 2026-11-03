import { toCategorySlug } from "@/utils/blogTaxonomy";
import { getCollection, type CollectionEntry } from "astro:content";

type BitsPost = CollectionEntry<"Bits">;

/** Published Bid posts, newest first. */
export async function getBitsPosts() {
  return (await getCollection("Bits"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * Tags (slug -> label) in order of first use, newest post first: the Bid
 * categories, each with a /the-bid/<slug>/<page> listing.
 */
export function getBitsTags(posts: BitsPost[]) {
  const tags = new Map<string, string>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = toCategorySlug(tag);
      if (!tags.has(slug)) {
        tags.set(slug, tag.charAt(0).toUpperCase() + tag.slice(1));
      }
    }
  }
  return tags;
}

/** The post's tags as category slugs. */
export const getPostTagSlugs = (post: BitsPost) => [
  ...new Set(post.data.tags.map(toCategorySlug)),
];
