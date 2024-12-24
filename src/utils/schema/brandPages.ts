import { defineCollection, z } from "astro:content";

export const brandResourcesSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      cards: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          image: image(),
          button: z.object({
            label: z.string(),
            link: z.string(),
            enable: z.boolean(),
            icon: z.string(),
          }),
        }),
      ),
    });
  },
});

export const brandReleasesInsightsSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      cards: z.array(
        z.object({
          image: image(),
          title: z.string(),
          description: z.string(),
          button: z.object({
            label: z.string(),
            link: z.string(),
            enable: z.boolean(),
          }),
        }),
      ),
    });
  },
});

export const pressSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      image: image(),
      title: z.string(),
      pubDate: z.coerce.date(),
      author: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      externalLink: z.string(),
    });
  },
});
