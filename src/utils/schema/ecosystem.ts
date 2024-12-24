import { defineCollection, z } from "astro:content";

const baseSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      projectImage: image(),
      projectTitle: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()),
      ctaButton: z.object({
        label: z.string(),
        link: z.string(),
        enable: z.boolean(),
      }),
      category: z.string(),
      showcase: z.boolean().optional(),
      githubLink: z.string().optional(),
      twitterLink: z.string().optional(),
      discordLink: z.string().optional(),
      websiteLink: z.string().optional(),
    });
  },
});

export const ecosystemSchema = baseSchema;

export const akashTools = baseSchema;
export const deployedOnAkash = baseSchema;
export const showcase = baseSchema;
