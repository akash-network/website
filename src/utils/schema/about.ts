import { defineCollection, z } from "astro:content";

export const aboutSchema = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      // optional
      disableTableOfContents: z.boolean().optional(),
      contentWidth: z.string().optional(),
    });
  },
});
