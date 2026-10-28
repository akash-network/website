import { docsSequence as docs } from "@/content/Docs/_sequence";
import { ChevronRightIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// Types
interface NavItem {
  label: string;
  link?: string;
  subItems?: NavItem[];
  type?: string;
}

interface DocsNavProps {
  docsNav?: NavItem[];
  pathName?: string[];
}

// Constants
const STORAGE_KEYS = {
  SCROLL: "docs-sidebar-scroll",
  OPEN_SECTIONS: "docs-open-sections",
} as const;

const STYLES = {
  link: {
    base: "flex min-h-8 items-center rounded-md px-2 py-1.5 text-sm leading-5 transition-colors",
    active: "bg-neutral-100 font-medium text-foreground dark:bg-neutral-800/80",
    inactive:
      "text-neutral-600 hover:bg-neutral-100/70 hover:text-foreground dark:text-neutral-400 dark:hover:bg-neutral-800/50",
  },
  folder: {
    base: "flex min-h-8 w-full items-center gap-1 rounded-md text-sm leading-5 transition-colors",
  },
  section: {
    // dark: variant needed to beat the global `.dark h2/h3` foreground rule
    header:
      "px-2 pb-1 text-[13px] leading-4 text-neutral-500 dark:text-neutral-500",
    title:
      "px-2 pb-1 pt-2 text-[13px] leading-4 text-neutral-500 dark:text-neutral-500",
  },
} as const;

// Utility Functions
const normalizePath = (path: string): string => path.replace(/\/$/, "");

const getFirstLink = (item: NavItem): string | null => {
  if (item.link) return item.link;

  if (item.subItems?.length) {
    for (const subItem of item.subItems) {
      if (subItem.link) return subItem.link;
      if (subItem.subItems?.length) {
        const nestedLink = getFirstLink(subItem);
        if (nestedLink) return nestedLink;
      }
    }
  }
  return null;
};

const buildSectionPath = (parentPath: string, label: string): string => {
  return parentPath ? `${parentPath}/${label}` : label;
};

// Custom Hooks
function useScrollRestoration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let sidebar: HTMLElement | null = null;
    let scrollTimeout: NodeJS.Timeout;
    let isRestoring = false;
    let isUserScrolling = false;
    let userScrollTimeout: NodeJS.Timeout;
    let justNavigated = false;

    const getSidebar = (): HTMLElement | null => {
      if (!sidebar || !document.contains(sidebar)) {
        sidebar = document.getElementById("docs-sidebar");
      }
      return sidebar;
    };

    const saveScroll = () => {
      const el = getSidebar();
      if (el && !isRestoring) {
        sessionStorage.setItem(STORAGE_KEYS.SCROLL, el.scrollTop.toString());
      }
    };

    const restoreScroll = () => {
      const el = getSidebar();
      if (!el) {
        setTimeout(restoreScroll, 10);
        return;
      }

      const saved = sessionStorage.getItem(STORAGE_KEYS.SCROLL);
      if (saved === null) return;

      const targetPos = parseInt(saved, 10);
      if (isNaN(targetPos)) return;

      isRestoring = true;
      el.scrollTop = targetPos;

      requestAnimationFrame(() => {
        if (el) el.scrollTop = targetPos;
      });

      const attempts = [0, 10, 50, 100, 200];
      attempts.forEach((delay) => {
        setTimeout(() => {
          const currentEl = getSidebar();
          if (currentEl && !isUserScrolling) {
            currentEl.scrollTop = targetPos;
            if (delay === 200) {
              isRestoring = false;
            }
          }
        }, delay);
      });
    };

    const init = () => {
      const el = getSidebar();
      if (!el) {
        setTimeout(init, 50);
        return;
      }

      restoreScroll();

      let lastSavedPosition = el.scrollTop;
      const handleScrollSave = () => {
        if (isRestoring) return;
        lastSavedPosition = el.scrollTop;
        sessionStorage.setItem(
          STORAGE_KEYS.SCROLL,
          lastSavedPosition.toString(),
        );
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(saveScroll, 250);
        justNavigated = false;
      };

      const handleUserScroll = () => {
        isUserScrolling = true;
        clearTimeout(userScrollTimeout);
        userScrollTimeout = setTimeout(() => {
          isUserScrolling = false;
        }, 150);
      };

      el.addEventListener("scroll", handleScrollSave, { passive: true });
      el.addEventListener("scroll", handleUserScroll, { passive: true });

      const monitorScroll = setInterval(() => {
        if (isUserScrolling || isRestoring || !justNavigated) return;

        const currentEl = getSidebar();
        if (!currentEl) return;

        const currentPos = currentEl.scrollTop;
        const saved = sessionStorage.getItem(STORAGE_KEYS.SCROLL);

        if (saved !== null && currentPos === 0 && parseInt(saved, 10) > 100) {
          isRestoring = true;
          currentEl.scrollTop = parseInt(saved, 10);
          setTimeout(() => {
            isRestoring = false;
            justNavigated = false;
          }, 50);
        } else if (currentPos > 0) {
          justNavigated = false;
        }
      }, 200);

      const handleAfterNav = () => {
        justNavigated = true;
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 150);
        setTimeout(restoreScroll, 300);
        setTimeout(() => {
          justNavigated = false;
        }, 1000);
      };

      document.addEventListener("astro:before-preparation", saveScroll);
      document.addEventListener("astro:before-swap", saveScroll);
      document.addEventListener("astro:after-swap", handleAfterNav);
      document.addEventListener("astro:page-load", handleAfterNav);

      const observer = new MutationObserver(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.SCROLL);
        if (saved !== null) {
          setTimeout(restoreScroll, 0);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        clearInterval(monitorScroll);
        clearTimeout(scrollTimeout);
        clearTimeout(userScrollTimeout);
        el?.removeEventListener("scroll", handleScrollSave);
        el?.removeEventListener("scroll", handleUserScroll);
        document.removeEventListener("astro:before-preparation", saveScroll);
        document.removeEventListener("astro:before-swap", saveScroll);
        document.removeEventListener("astro:after-swap", handleAfterNav);
        document.removeEventListener("astro:page-load", handleAfterNav);
        observer.disconnect();
      };
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      setTimeout(init, 0);
    }
  }, []);
}

function useOpenSections(
  docsNav: NavItem[],
  currentPath: string,
): [
  Set<string>,
  (sectionPath: string, item: NavItem, e: React.MouseEvent) => void,
] {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const currentPathRef = useRef<string>(currentPath);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateOpenSections = () => {
      const newPath = window.location.pathname;
      const newOpenSections = new Set<string>();

      const checkPath = (
        items: NavItem[],
        parentPath: string = "",
      ): boolean => {
        let foundMatch = false;
        items.forEach((item) => {
          const fullPath = buildSectionPath(parentPath, item.label);
          if (item.link && newPath.startsWith(item.link)) {
            newOpenSections.add(fullPath);
            foundMatch = true;
          }
          if (item.subItems?.length) {
            const hadMatch = checkPath(item.subItems, fullPath);
            if (hadMatch) {
              newOpenSections.add(fullPath);
              foundMatch = true;
            }
          }
        });
        return foundMatch;
      };

      const actualNav =
        docsNav[0]?.label === "Docs" ? docsNav[0].subItems || [] : docsNav;
      checkPath(actualNav);

      try {
        const stored = sessionStorage.getItem(STORAGE_KEYS.OPEN_SECTIONS);
        if (stored) {
          const storedArray = JSON.parse(stored);
          storedArray.forEach((path: string) => newOpenSections.add(path));
        }
      } catch (e) {
        // Ignore parse errors
      }

      setOpenSections(newOpenSections);
      sessionStorage.setItem(
        STORAGE_KEYS.OPEN_SECTIONS,
        JSON.stringify(Array.from(newOpenSections)),
      );
    };

    updateOpenSections();

    document.addEventListener("astro:page-load", updateOpenSections);
    document.addEventListener("astro:after-swap", updateOpenSections);
    window.addEventListener("popstate", updateOpenSections);

    const interval = setInterval(() => {
      const newPath = window.location.pathname;
      if (newPath !== currentPathRef.current) {
        updateOpenSections();
      }
    }, 300);

    return () => {
      document.removeEventListener("astro:page-load", updateOpenSections);
      document.removeEventListener("astro:after-swap", updateOpenSections);
      window.removeEventListener("popstate", updateOpenSections);
      clearInterval(interval);
    };
  }, [docsNav]);

  const toggleSection = (
    sectionPath: string,
    item: NavItem,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setOpenSections((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(sectionPath);

      if (isOpen) {
        next.delete(sectionPath);
      } else {
        next.add(sectionPath);
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          STORAGE_KEYS.OPEN_SECTIONS,
          JSON.stringify(Array.from(next)),
        );
      }

      return next;
    });
  };

  return [openSections, toggleSection];
}

// Components
interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  depth: number;
}

function NavLink({ item, isActive }: NavLinkProps) {
  const stateClass = isActive ? STYLES.link.active : STYLES.link.inactive;

  return (
    <a
      href={item.link}
      aria-current={isActive ? "page" : undefined}
      className={`${STYLES.link.base} ${stateClass}`}
    >
      {item.label}
    </a>
  );
}

interface NavFolderProps {
  item: NavItem;
  sectionPath: string;
  isOpen: boolean;
  isActive: boolean;
  depth: number;
  onToggle: (sectionPath: string, item: NavItem, e: React.MouseEvent) => void;
  openSections: Set<string>;
  currentPath: string;
}

function NavFolder({
  item,
  sectionPath,
  isOpen,
  isActive,
  depth,
  onToggle,
  openSections,
  currentPath,
}: NavFolderProps) {
  if (depth === 0) {
    return (
      <div className="pt-5 first:pt-0">
        <h3 className={STYLES.section.header}>{item.label}</h3>
        <div className="space-y-px">
          {item.subItems?.map((subItem) => (
            <NavItem
              key={subItem.label || subItem.link}
              item={subItem}
              depth={depth + 1}
              parentPath={sectionPath}
              openSections={openSections}
              currentPath={currentPath}
              onToggle={(sp, it, e) => onToggle(sp, it, e)}
            />
          ))}
        </div>
      </div>
    );
  }

  const stateClass = isActive ? STYLES.link.active : STYLES.link.inactive;

  // If item has a direct link (from index.md), clicking should navigate
  // Otherwise, clicking toggles the dropdown
  const hasDirectLink = Boolean(item.link);
  const linkUrl = hasDirectLink ? item.link : getFirstLink(item) || "#";

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(sectionPath, item, e);
  };

  const handleTextClick = (e: React.MouseEvent) => {
    // If there's no direct link, prevent navigation and toggle instead
    if (!hasDirectLink) {
      e.preventDefault();
      e.stopPropagation();
      onToggle(sectionPath, item, e);
    }
    // If there's a direct link, let it navigate normally
  };

  return (
    <>
      <div className={`${STYLES.folder.base} ${stateClass}`}>
        <a
          href={linkUrl}
          onClick={handleTextClick}
          aria-current={isActive ? "page" : undefined}
          className="flex-1 py-1.5 pl-2"
        >
          {item.label}
        </a>
        <button
          type="button"
          onClick={handleChevronClick}
          className="mr-1 flex-shrink-0 cursor-pointer rounded p-1 text-neutral-400 transition-colors hover:text-foreground dark:text-neutral-500"
          aria-label={isOpen ? "Close section" : "Open section"}
          aria-expanded={isOpen}
        >
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
          />
        </button>
      </div>
      {isOpen && item.subItems && (
        <div className="my-0.5 ml-3 space-y-px border-l border-[#e6e8eb] pl-2 dark:border-[#333]">
          {item.subItems.map((subItem) => (
            <NavItem
              key={subItem.label || subItem.link}
              item={subItem}
              depth={depth + 1}
              parentPath={sectionPath}
              openSections={openSections}
              currentPath={currentPath}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface NavItemProps {
  item: NavItem;
  depth?: number;
  parentPath?: string;
  openSections: Set<string>;
  currentPath: string;
  onToggle?: (sectionPath: string, item: NavItem, e: React.MouseEvent) => void;
}

function NavItem({
  item,
  depth = 0,
  parentPath = "",
  openSections,
  currentPath,
  onToggle,
}: NavItemProps) {
  const sectionPath = buildSectionPath(parentPath, item.label);
  const hasSubItems = Boolean(item.subItems?.length);
  const isOpen = openSections.has(sectionPath);
  const isActive =
    typeof window !== "undefined" &&
    Boolean(item.link) &&
    normalizePath(item.link!) === normalizePath(currentPath);

  if (hasSubItems && onToggle) {
    return (
      <NavFolder
        item={item}
        sectionPath={sectionPath}
        isOpen={isOpen}
        isActive={isActive}
        depth={depth}
        onToggle={onToggle}
        openSections={openSections}
        currentPath={currentPath}
      />
    );
  }

  return <NavLink item={item} isActive={isActive} depth={depth} />;
}

interface SectionProps {
  section: { header?: string; items: NavItem[] };
  openSections: Set<string>;
  currentPath: string;
  onToggle: (sectionPath: string, item: NavItem, e: React.MouseEvent) => void;
}

function Section({
  section,
  openSections,
  currentPath,
  onToggle,
}: SectionProps) {
  return (
    <div>
      {section.header && (
        <h2 className={STYLES.section.title}>{section.header}</h2>
      )}
      <div>
        {section.items.map((item) => (
          <NavItem
            key={item.label || item.link}
            item={item}
            openSections={openSections}
            currentPath={currentPath}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

// Main Component
export function DocsNav({ docsNav = [], pathName = [] }: DocsNavProps) {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "",
  );

  useScrollRestoration();

  const [openSections, toggleSection] = useOpenSections(docsNav, currentPath);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePath = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
      }
    };

    updatePath();
    document.addEventListener("astro:page-load", updatePath);
    document.addEventListener("astro:after-swap", updatePath);
    window.addEventListener("popstate", updatePath);

    return () => {
      document.removeEventListener("astro:page-load", updatePath);
      document.removeEventListener("astro:after-swap", updatePath);
      window.removeEventListener("popstate", updatePath);
    };
  }, [currentPath]);

  // Build sections from navigation
  const actualNav =
    docsNav[0]?.label === "Docs" ? docsNav[0].subItems || [] : docsNav;
  const { subItems: docsSequence } = docs[0];

  const sections: Array<{ header?: string; items: NavItem[] }> = [];
  let currentSection: { header?: string; items: NavItem[] } = { items: [] };

  actualNav.forEach((navItem) => {
    const itemIndex = docsSequence.findIndex(
      (seqItem) => seqItem.label === navItem.label,
    );

    if (itemIndex > 0) {
      const prevItem = docsSequence[itemIndex - 1];
      if (prevItem.type === "Header") {
        if (currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          header: prevItem.label,
          items: [],
        };
      }
    }

    currentSection.items.push(navItem);
  });

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return (
    <nav className="space-y-5 overflow-y-auto">
      {sections.map((section, sectionIndex) => (
        <Section
          key={sectionIndex}
          section={section}
          openSections={openSections}
          currentPath={currentPath}
          onToggle={toggleSection}
        />
      ))}
    </nav>
  );
}

export const HomeButton = ({ pathname }: { pathname: string }) => {
  const isActive = pathname === "/docs/" || pathname === "/docs";
  const stateClass = isActive ? STYLES.link.active : STYLES.link.inactive;

  return (
    <a
      href="/docs/"
      aria-current={isActive ? "page" : undefined}
      className={`${STYLES.link.base} gap-2 ${stateClass}`}
    >
      <span>Home</span>
    </a>
  );
};
