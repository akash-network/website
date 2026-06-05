import { defineCollection, z } from "astro:content";
import { contentLoader } from "@/utils/schema/contentLoader";

export const communityPagesSchema = defineCollection({
  loader: contentLoader("Community_Page"),
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),

      disableTableOfContents: z.boolean().optional(),
      contentWidth: z.string().optional(),
      disableTitle: z.boolean().optional(),
    });
  },
});
