import { execSync } from "child_process";
import { existsSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

const projectRoot = process.cwd();
const cacheFile = join(projectRoot, ".lastmod-cache.json");

interface LastModCache {
  [filePath: string]: string; // ISO date string
}

/**
 * Get the last commit date for a file using git log
 */
function getGitLastMod(filePath: string): string | null {
  try {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      return null;
    }

    const result = execSync(
      `git log -1 --pretty="format:%cI" -- "${fullPath}" 2>/dev/null || echo ""`,
      { encoding: "utf-8", cwd: projectRoot },
    ).trim();

    if (result) {
      return result;
    }
  } catch (error) {
    // File might not be tracked or git might not be available
  }
  return null;
}

/**
 * Recursively find all files matching extensions
 */
function findFiles(
  dir: string,
  extensions: string[],
  fileList: string[] = [],
): string[] {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, extensions, fileList);
    } else if (stat.isFile()) {
      const ext = file.split(".").pop()?.toLowerCase();
      if (ext && extensions.includes(ext)) {
        const relativePath = relative(projectRoot, filePath);
        fileList.push(relativePath);
      }
    }
  }

  return fileList;
}

/**
 * Generate lastmod cache for all .md and .astro files
 */
function generateCache() {
  console.log("Generating lastmod cache from git commit history...");

  const cache: LastModCache = {};

  // Find all .md and .mdx files in src/content
  const contentDir = join(projectRoot, "src/content");
  const mdFiles = existsSync(contentDir)
    ? findFiles(contentDir, ["md", "mdx"])
    : [];

  // Find all .astro files in src/pages
  const pagesDir = join(projectRoot, "src/pages");
  const astroFiles = existsSync(pagesDir)
    ? findFiles(pagesDir, ["astro"])
    : [];

  // Find all component files in src/components (.tsx, .astro, .ts, .jsx)
  const componentsDir = join(projectRoot, "src/components");
  const componentFiles = existsSync(componentsDir)
    ? findFiles(componentsDir, ["tsx", "astro", "ts", "jsx"])
    : [];

  const allFiles = [...mdFiles, ...astroFiles, ...componentFiles];
  const totalFiles = allFiles.length;
  let processed = 0;

  console.log(`Found ${totalFiles} files to process...`);

  for (const file of allFiles) {
    const lastMod = getGitLastMod(file);
    if (lastMod) {
      cache[file] = lastMod;
    }
    processed++;
    if (processed % 50 === 0) {
      console.log(`Processed ${processed}/${totalFiles} files...`);
    }
  }

  // Write cache file
  writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf-8");
  console.log(
    `\n✓ Cache generated: ${Object.keys(cache).length} files with lastmod dates`,
  );
  console.log(`  Cache file: ${cacheFile}`);
}

generateCache();
