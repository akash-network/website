// Import the SearchDialog and SortDropDown components from their respective files.
import SearchDialog from "./search-dialog";
import SortDropDown from "./sort-dropdown";

// This component takes a URL called 'astroUrl' as a prop.
export const SortActions = ({ astroUrl }: { astroUrl: URL }) => {
  return (
    <div className="flex items-center justify-between gap-x-[10px] lg:gap-x-[36px]">
      {/* Render the SearchDialog component with the current path from 'astroUrl'. */}
      <SearchDialog currentPath={astroUrl.pathname} />

      <div className="flex items-center gap-x-3 ">
        <p className="flex-shrink-0 text-xs  text-foreground">
          {/* Label for the SortDropDown component. */}
          Sort By
        </p>
        {/* Render the SortDropDown component with the current path from 'astroUrl'. */}
        <SortDropDown currentPath={astroUrl.pathname} />
      </div>
    </div>
  );
};
