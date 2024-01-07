import { defineCollection, z } from "astro:content";

export const privacySchema = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      // Required fields
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      draft: z.coerce.boolean(),
      images: z.array(z.string()),
      // Optional fields
    });
  },
});
