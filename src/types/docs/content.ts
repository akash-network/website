/**
 * Content collection page frontmatter
 */
export interface DocsPageFrontmatter {
  linkTitle?: string;
  weight?: number;
  hideFromNav?: boolean;
  title?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
}
