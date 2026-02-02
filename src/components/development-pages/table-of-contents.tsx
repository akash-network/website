import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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

    return (
      <li>
        <a
          className={`flex items-center text-base ${
            depth === 2 ? "font-bold" : "font-normal"
          } leading-[24px] text-[#808080]  hover:text-primary depth-${depth} ${
            currentHeading.slug === slug && "text-primary"
          }`.trim()}
          href={`#${slug}`}
          onClick={onLinkClick}
        >
          {depth === 2 ? <ChevronRight className="mr-1 h-4 w-4" /> : null}

          {text}
        </a>
        {children.length > 0 ? (
          <ul className="ml-10 mt-3 space-y-3 text-xs">
            {children.map((heading) => (
              <TableOfContentsItem key={heading.slug} heading={heading} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <>
      <ul className="space-y-3 ">
        {toc.map((heading2) => (
          <TableOfContentsItem key={heading2.slug} heading={heading2} />
        ))}
      </ul>
    </>
  );
};

export default TableOfContents;
