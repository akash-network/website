import { defineCollection, z } from "astro:content";

export const tokenPage = defineCollection({
  schema: ({ image }) => {
    return z.object({
      heroSection: z.object({
        title: z.string(),
        description: z.string(),
      }),

      ecosystemSection: z.object({
        title: z.string(),
        description: z.string(),

        table: z.array(
          z.object({
            row: z.array(
              z.object({
                title: z.string(),

                link: z.string().optional(),
              }),
            ),
          }),
        ),
      }),

      buyingAKTSection: z.object({
        title: z.string(),
        description: z.string(),

        table: z.array(
          z.object({
            row: z.array(
              z.object({
                title: z.string(),

                link: z.string().optional(),
              }),
            ),
          }),
        ),
      }),

      aktFeaturesSection: z.object({
        title: z.string(),
        description: z.string(),
      }),

      faqsSection: z.object({
        title: z.string(),
        faqs: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          }),
        ),
      }),
    });
  },
});
