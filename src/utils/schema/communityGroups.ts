import { defineCollection, z } from "astro:content";

export const communityGroupsSchema = defineCollection({
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
