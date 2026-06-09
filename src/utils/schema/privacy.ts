import { defineCollection, z } from "astro:content";
import { contentLoader } from "@/utils/schema/contentLoader";

export const privacySchema = defineCollection({
  loader: contentLoader("Privacy_Homepage"),
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      draft: z.coerce.boolean().default(false),
      images: z.array(z.string()),
    });
  },
});
