import { defineCollection, z } from "astro:content";

export const networkPagesSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      disableTableOfContents: z.boolean().optional(),
      contentWidth: z.string().optional(),
    });
  },
});
