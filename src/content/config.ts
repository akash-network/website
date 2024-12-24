import { aboutSchema } from "@/utils/schema/about";
import {
  brandReleasesInsightsSchema,
  brandResourcesSchema,
} from "@/utils/schema/brandPages";
import {
  communityAkashEduSchema,
  communityContributionsSchema,
  communityEventSchema,
} from "@/utils/schema/communityContributions";
import { communityGroupsSchema } from "@/utils/schema/communityGroups";
import { communityPagesSchema } from "@/utils/schema/communityPages";
import { deployPage } from "@/utils/schema/deploy_page";
import { developmentSchema } from "@/utils/schema/development";
import { docsSchema } from "@/utils/schema/docsSchema";
import { ecosystemSchema } from "@/utils/schema/ecosystem";
import { homePageSchema } from "@/utils/schema/homepage";
import { privacySchema } from "@/utils/schema/privacy";
import { providersPage } from "@/utils/schema/provides_page";
import { roadmapSchema } from "@/utils/schema/roadmap";
import { tokenPage } from "@/utils/schema/token_page";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      draft: z.coerce.boolean(),
      categories: z.array(z.string()),
      tags: z.array(z.string()),
      contributors: z.array(z.string()),
      bannerImage: image(),
      updatedDate: z.coerce.date().optional(),
      pinned: z.coerce.date().optional(),
      homepage: z.coerce.date().optional(),
      archive: z.boolean().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
    });
  },
});

export const collections = {
  Blog: blog,
  Homepage: homePageSchema,
  Token_Homepage: tokenPage,
  Deploy_Homepage: deployPage,
  Providers_Homepage: providersPage,
  Development_Page: developmentSchema,
  About_Page: aboutSchema,
  Brand_Resources_Homepage: brandResourcesSchema,
  Brand_Releases_Insights_Homepage: brandReleasesInsightsSchema,
  Community_Page: communityPagesSchema,
  Privacy_Homepage: privacySchema,
  Community_Contributions_Page: communityContributionsSchema,
  Community_Akash_Edu_Page: communityAkashEduSchema,
  Community_Akash_Events_Page: communityEventSchema,
  Development_Current_Groups_Page: communityGroupsSchema,
  Docs: docsSchema,
  Ecosystem_Page: ecosystemSchema,
  aeps: roadmapSchema,
};
