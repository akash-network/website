import { defineCollection, z } from "astro:content";

export const privacySchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      draft: z.coerce.boolean(),
      images: z.array(z.string()),
    });
  },
});
