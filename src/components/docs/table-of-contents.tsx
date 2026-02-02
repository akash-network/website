import { useCallback, useEffect, useRef, useState } from "react";
import type { TocItem } from "../../lib/generateToc";

interface Props {
  toc: TocItem[];
  labels: {
    onThisPage: string;
  };
}

const TableOfContents = ({ toc = [], labels }: Props) => {
  // Initialize the current heading state with the first item from the TOC.
  const [currentHeading, setCurrentHeading] = useState({
    slug: toc[0].slug,
    text: toc[0].text,
  });

  // Reference to the active link element
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Track if user is hovering over the TOC sidebar
  const isHoveringTocRef = useRef(false);

  // Scroll the active TOC item into view
  const scrollActiveIntoView = useCallback(() => {
    if (isHoveringTocRef.current) return;

    if (activeLinkRef.current) {
      const sidebar = activeLinkRef.current.closest("aside") as HTMLElement;
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const elementRect = activeLinkRef.current.getBoundingClientRect();

        // Check if element is outside the visible area of the sidebar
        const isAbove = elementRect.top < sidebarRect.top + 50;
        const isBelow = elementRect.bottom > sidebarRect.bottom - 50;

        if (isAbove || isBelow) {
          const sidebarScrollTop = sidebar.scrollTop;
          const elementRelativeTop =
            elementRect.top - sidebarRect.top + sidebarScrollTop;
          const sidebarHeight = sidebar.clientHeight;
          const elementHeight = activeLinkRef.current.clientHeight;

          // Center the element in the visible area
          const targetScroll =
            elementRelativeTop - sidebarHeight / 2 + elementHeight / 2;

          sidebar.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: "smooth",
          });
        }
      }
    }
  }, []);

  // Scroll active item into view when current heading changes
  useEffect(() => {
    // Small delay to ensure the DOM has updated with the new active class
    const timeoutId = setTimeout(scrollActiveIntoView, 100);
    return () => clearTimeout(timeoutId);
  }, [currentHeading, scrollActiveIntoView]);

  // Define the ID for the "On This Page" heading.
  const onThisPageID = "on-this-page-heading";

  // Use the `useEffect` hook to set up an Intersection Observer for headings.
  useEffect(() => {
    // Define the callback for the Intersection Observer.

    const setCurrent: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const { id } = entry.target;
          if (id === onThisPageID) continue;

          setCurrentHeading({
            slug: entry.target.id,
            text: entry.target.textContent || "",
          });
          break;
        }
      }
    };

    // Define options for the Intersection Observer.
    const observerOptions: IntersectionObserverInit = {
      // Negative top margin accounts for `scroll-margin`.
      // Negative bottom margin means heading needs to be towards top of viewport to trigger intersection.
      rootMargin: "-100px 0% -66%",
      threshold: 1,
    };

    // Create an Intersection Observer for headings.
    const headingsObserver = new IntersectionObserver(
      setCurrent,
      observerOptions,
    );

    // Observe all the headings in the main page content.
    document
      .querySelectorAll("article :is(h1,h2, h3)")
      .forEach((h) => headingsObserver.observe(h));

    // Stop observing when the component is unmounted.
    return () => headingsObserver.disconnect();
  }, []);

  // Function to handle link clicks and update the current heading.
  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setCurrentHeading({
      slug: e.currentTarget.getAttribute("href")!.replace("#", ""),
      text: e.currentTarget.textContent || "",
    });
  };

  // Component for rendering individual Table of Contents items.
  const TableOfContentsItem = ({ heading }: { heading: TocItem }) => {
    const { depth, slug, text, children } = heading;
    const isActive = currentHeading.slug === slug;

    return (
      <li>
        <a
          ref={isActive ? activeLinkRef : null}
          className={` flex  items-center text-sm ${
            depth === 2 ? "" : "font-normal"
          } leading-[24px]  text-[#808080] hover:text-primary  depth-${depth} ${
            isActive && "text-primary"
          }`.trim()}
          href={`#${slug}`}
          onClick={onLinkClick}
        >
          {text}
        </a>
        {children.length > 0 ? (
          <ul className="ml-2 mt-1  space-y-1 text-sm ">
            {children.map((heading) => (
              <TableOfContentsItem key={heading.slug} heading={heading} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <div
      onMouseEnter={() => {
        isHoveringTocRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringTocRef.current = false;
      }}
    >
      <ul className="space-y-1 ">
        {toc.map((heading2) => (
          <TableOfContentsItem key={heading2.slug} heading={heading2} />
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;
