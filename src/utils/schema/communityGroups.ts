import { defineCollection, z } from "astro:content";
import { contentLoader } from "@/utils/schema/contentLoader";

export const communityGroupsSchema = defineCollection({
  loader: contentLoader("Development_Current_Groups_Page"),
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      heading: z.string().optional(),
      centeredHeader: z.boolean().optional().default(false),
      description: z.string(),
      category: z.string(),
      meetings: z.object({
        dateLabel: z.string(),
        link: z.object({
          label: z.string(),
          link: z.string(),
        }),
      }),
      githubLink: z.string(),
      discordLink: z.string(),
      pubDate: z.coerce.date().optional(),
    });
  },
});
