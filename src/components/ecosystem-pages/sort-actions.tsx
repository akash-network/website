// Import the SearchDialog and SortDropDown components from their respective files.
import SearchDialog from "./search-dialog";
import SortDropDown from "./sort-dropdown";
import TagsSortDropDown from "./tags-sort-dropdown";

// This component takes a URL called 'astroUrl' as a prop.
export const SortActions = ({ astroUrl }: { astroUrl: URL }) => {
  return (
    <div className="flex items-center justify-between gap-x-[32px] lg:max-w-[500px] lg:flex-row-reverse lg:justify-start lg:gap-x-[36px]">
      {/* Render the SearchDialog component with the current path from 'astroUrl'. */}

      <SearchDialog currentPath={astroUrl.pathname} />

      <div className="flex flex-shrink-0 items-center gap-x-3 md:gap-x-3 lg:gap-x-9">
        {astroUrl.pathname.split("/")[3] === "latest" ||
        astroUrl.pathname.split("/")[3] === "oldest" ? (
          <SortDropDown currentPath={astroUrl.pathname} />
        ) : (
          <TagsSortDropDown currentPath={astroUrl.pathname} />
        )}
      </div>
    </div>
  );
};
