import { defineCollection, z } from "astro:content";

const baseSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      image: image(),
      title: z.string(),
      readTime: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()),
      author: z.string(),
      description: z.string(),
      link: z.string().optional(),
    });
  },
});

export const communityContributionsSchema = baseSchema;
export const communityAkashEduSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      image: image(),
      title: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()),
      description: z.string(),
      author: z.string().optional(),
      readTime: z.string().optional(),
      link: z.string().optional(),
    });
  },
});

export const communityEventSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      image: image(),
      title: z.string(),
      link: z.string(),
      eventDate: z.coerce.date(),
      tbd: z.boolean().optional(),
      location: z.string(),
      description: z.string(),
      tags: z.array(z.string()).optional(),
      cta: z
        .array(
          z.object({
            text: z.string(),
            link: z.string(),
          }),
        )
        .optional(),
    });
  },
});
