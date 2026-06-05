import { defineCollection, z } from "astro:content";
import { contentLoader } from "@/utils/schema/contentLoader";

export const developmentSchema = defineCollection({
  loader: contentLoader("Development_Page"),
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      centeredHeader: z.boolean().optional().default(false),
      hideHeader: z.boolean().optional().default(false),
    });
  },
});
