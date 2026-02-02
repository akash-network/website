import type { CollectionEntry } from "astro:content";

/**
 * Roadmap entry type (AEPs)
 */
export type RoadmapEntry = CollectionEntry<"aeps">;

/**
 * Roadmap quarters structure
 */
export interface RoadmapQuarters {
  Q1: RoadmapEntry[];
  Q2: RoadmapEntry[];
  Q3: RoadmapEntry[];
  Q4: RoadmapEntry[];
}

/**
 * Docs collection entry type
 */
export type DocsEntry = CollectionEntry<"Docs">;

/**
 * Blog collection entry type
 */
export type BlogEntry = CollectionEntry<"Blog">;

/**
 * Ecosystem page collection entry type
 */
export type EcosystemEntry = CollectionEntry<"Ecosystem_Page">;

/**
 * Token homepage collection entry type
 */
export type TokenHomepageEntry = CollectionEntry<"Token_Homepage">;

/**
 * Community contributions collection entry type
 */
export type CommunityContributionsEntry = CollectionEntry<"Community_Contributions_Page">;

/**
 * Development page collection entry type
 */
export type DevelopmentPageEntry = CollectionEntry<"Development_Page">;

/**
 * About page collection entry type
 */
export type AboutPageEntry = CollectionEntry<"About_Page">;

/**
 * Community page collection entry type
 */
export type CommunityPageEntry = CollectionEntry<"Community_Page">;

/**
 * Generic page data structure from Astro content collections
 */
export interface PageData {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: Record<string, unknown>;
}
