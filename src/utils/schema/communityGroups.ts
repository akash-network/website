import { defineCollection, z } from "astro:content";

export const communityGroupsSchema = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      heading: z.string(),
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
