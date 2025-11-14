import { defineCollection, z } from "astro:content";

export const tokenPage = defineCollection({
  schema: ({ image }) => {
    return z.object({
      heroSection: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
      }),

      buyAktSection: z.object({
        title: z.string(),
        description: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            link: z.string(),
            icon: z.string(),
          }),
        ),
      }),

      howItWorksSection: z.object({
        title: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string(),
          }),
        ),
      }),

      ecosystemSection: z.object({
        title: z.string(),
        description: z.string(),
        categories: z.array(
          z.object({
            title: z.string(),
            items: z.array(
              z.object({
                title: z.string(),
                link: z.string(),
                icon: z.string(),
              }),
            ),
          }),
        ),
      }),

      buyingAKTSection: z.object({
        title: z.string(),
        description: z.string(),
        categories: z.array(
          z.object({
            title: z.string(),
            items: z.array(
              z.object({
                title: z.string(),
                link: z.string(),
                icon: z.string(),
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
