import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"Blog">;

/** Topics need at least this many posts to be offered in the blog filter. */
const MIN_TOPIC_POSTS = 3;

/** URL segment of a category page: "AI & ML" -> "ai-&-ml" (matches existing routes). */
export const toCategorySlug = (category: string) =>
  category.toLowerCase().replaceAll(" ", "-");

/** Filter value of a topic (tag): "NVIDIA H100" -> "nvidia-h100". */
export const toTopicSlug = (tag: string) =>
  tag
    .trim()
    .toLowerCase()
    .replace(/[\s,]+/g, "-");

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const isCaseStudy = (post: BlogPost) =>
  post.data.categories.some((c) => c.toLowerCase() === "case studies");

export const byNewest = (a: BlogPost, b: BlogPost) =>
  new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();

/**
 * Categories (slug -> label) in order of first use, newest post first: the set
 * the category pages are generated from.
 */
export function getBlogCategories(posts: BlogPost[]) {
  const categories = new Map<string, string>();
  for (const post of [...posts].sort(byNewest)) {
    if (isCaseStudy(post)) continue;
    for (const category of post.data.categories) {
      const slug = toCategorySlug(category);
      if (slug === "archive" || categories.has(slug)) continue;
      categories.set(slug, capitalize(category));
    }
  }
  return categories;
}

/**
 * Filterable topics: tags used by at least MIN_TOPIC_POSTS posts, merged case-
 * insensitively and excluding tags that repeat a category name (those already
 * have their own pages) or "Case Studies" (case studies live under
 * /case-studies). Labels use the most common spelling.
 */
export function getBlogTopics(posts: BlogPost[]) {
  const categorySlugs = new Set([
    "case-studies",
    ...posts.flatMap((post) => post.data.categories.map(toCategorySlug)),
  ]);
  const topics = new Map<
    string,
    { count: number; spellings: Map<string, number> }
  >();
  for (const post of posts) {
    if (isCaseStudy(post)) continue;
    const seen = new Set<string>();
    for (const tag of post.data.tags) {
      const slug = toTopicSlug(tag);
      if (
        !slug ||
        seen.has(slug) ||
        categorySlugs.has(toCategorySlug(tag.trim()))
      )
        continue;
      seen.add(slug);
      const topic = topics.get(slug) ?? { count: 0, spellings: new Map() };
      topic.count += 1;
      topic.spellings.set(
        tag.trim(),
        (topic.spellings.get(tag.trim()) ?? 0) + 1,
      );
      topics.set(slug, topic);
    }
  }
  return [...topics]
    .filter(([, topic]) => topic.count >= MIN_TOPIC_POSTS)
    .map(([slug, topic]) => {
      const [label] = [...topic.spellings].sort((a, b) => b[1] - a[1])[0];
      return { slug, label: capitalize(label) };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The post's tags that are filterable topics, as topic slugs. */
export const getPostTopicSlugs = (post: BlogPost, topicSlugs: Set<string>) => [
  ...new Set(
    post.data.tags.map(toTopicSlug).filter((slug) => topicSlugs.has(slug)),
  ),
];
