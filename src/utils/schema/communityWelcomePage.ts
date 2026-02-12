import { defineCollection, z } from "astro:content";

export const communityWelcomePageSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      communityCards: z.array(
        z.object({
          title: z.string(),
          icon: z.string(),
          description: z.string(),
        }),
      ),
      faqItems: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      ),
      quote: z.object({
        text: z.string(),
        author: z.string(),
        authorTitle: z.string(),
      }),
    });
  },
});
