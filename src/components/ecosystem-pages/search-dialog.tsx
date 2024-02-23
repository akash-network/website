import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Loader2, Search } from "lucide-react";

import Fuse from "fuse.js"; // Import the Fuse.js library

// Define a TypeScript interface for the project data
interface Project {
  projectTitle: string;
  projectDescription: string;
  projectLink: string;
  pubDate: string;
  projectImage: ProjectImage;
  githubLink: string;
  twitterLink: string;
  discordLink: string;
}

interface ProjectImage {
  src: string;
}

export default function SearchDialog({ currentPath }: { currentPath: string }) {
  // State variables
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionData, setCollectionData] = useState<Project[]>([]); // An array to store project data
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); // Filtered projects based on the search input
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error can be a string or null
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for the search query

  // Fuse.js options for searching projectTitle and projectDescription
  const fuseOptions = {
    keys: ["projectTitle", "projectDescription"],
  };

  // Function to close the modal
  function closeModal() {
    setIsOpen(false);
  }

  // Function to open the modal
  function openModal() {
    setIsOpen(true);
  }

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null); // Reset error state before fetching data

      // Fetch data when the dialog is open
      fetch(`/api/search/${currentPath.split("/")[2]}.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((jsonData) => {
          setCollectionData(jsonData as Project[]); // Type assertion to Project[]
          setFilteredProjects(jsonData.slice(0, 3)); // Initialize filteredProjects with the first 3 projects
        })
        .catch((err) => {
          setError(err.message);
          console.error("Error fetching data:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // Function to handle search input changes
  function handleSearchInput(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearchQuery(query);

    // Use Fuse.js to filter projects based on the search query
    const fuse = new Fuse(collectionData, fuseOptions);
    const results = fuse.search(query);
    const filteredResults = results.map((result) => result.item);

    // Show all filtered projects when the search query is not empty
    setFilteredProjects(
      query === "" ? collectionData.slice(0, 3) : filteredResults,
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center justify-center gap-x-1.5  rounded-md border  border-border bg-background2 px-3 py-2 text-xs font-medium leading-none text-sortText shadow-sm  hover:bg-gray-50 dark:hover:bg-darkGray md:px-3.5 md:py-2.5 md:text-sm"
      >
        <Search className="text-sm text-foreground" size={16} />
        Search
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/25 opacity-100 backdrop-blur transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-hidden">
            <div className="mt-12  flex  min-h-full items-start justify-center p-4 text-center md:mt-28">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg    p-6 text-left align-middle  transition-all ">
                  <div className="relative">
                    <input
                      className="block w-full rounded-lg border  bg-background2 py-3 pl-4 pr-12 text-base text-foreground placeholder:text-textGray focus:outline-none sm:text-sm sm:leading-6"
                      placeholder="Search for projects"
                      value={searchQuery}
                      onChange={handleSearchInput}
                    />
                    <svg
                      className="pointer-events-none absolute right-4 top-3 h-6 w-6 fill-sortText"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.47 21.53a.75.75 0 1 0 1.06-1.06l-1.06 1.06Zm-9.97-4.28a6.75 6.75 0 0 1-6.75-6.75h-1.5a8.25 8.25 0 0 0 8.25 8.25v-1.5ZM3.75 10.5a6.75 6.75 0 0 1 6.75-6.75v-1.5a8.25 8.25 0 0 0-8.25 8.25h1.5Zm6.75-6.75a6.75 6.75 0 0 1 6.75 6.75h1.5a8.25 8.25 0 0 0-8.25-8.25v1.5Zm11.03 16.72-5.196-5.197-1.061 1.06 5.197 5.197 1.06-1.06Zm-4.28-9.97c0 1.864-.755 3.55-1.977 4.773l1.06 1.06A8.226 8.226 0 0 0 18.75 10.5h-1.5Zm-1.977 4.773A6.727 6.727 0 0 1 10.5 17.25v1.5a8.226 8.226 0 0 0 5.834-2.416l-1.061-1.061Z"></path>
                    </svg>{" "}
                  </div>

                  {isLoading ? (
                    <div className="mt-6 flex justify-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="bg-primary/10 mt-6 rounded-lg px-6 py-4">
                      <h3 className="text-lg font-bold text-primary">
                        Something Bad Happened
                      </h3>
                      <p className="mt-1 line-clamp-4">{error}</p>
                    </div>
                  ) : isOpen ? (
                    <div className="mt-6 flex  max-h-[450px] flex-col   gap-y-5 overflow-y-auto lg:max-h-[600px]  xl:max-h-[600px]">
                      {filteredProjects.length === 0 ? (
                        <p className="flex items-center justify-center">
                          No results found
                        </p>
                      ) : (
                        filteredProjects.map((project, index) => (
                          <ProjectCard
                            key={index}
                            title={project.projectTitle}
                            description={project.projectDescription}
                            link={project.projectLink}
                            projectImage={project.projectImage.src}
                            githubLink={project.githubLink}
                            twitterLink={project.twitterLink}
                            discordLink={project.discordLink}
                          />
                        ))
                      )}
                    </div>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

const ProjectCard = ({
  title,
  description,
  link,
  projectImage,
  githubLink,
  twitterLink,
  discordLink,
}: {
  title: string;
  description: string;
  link: string;
  projectImage: string;
  githubLink: string;
  twitterLink: string;
  discordLink: string;
}) => {
  return (
    <a href={link}>
      <div className="border-md flex w-full">
        <div className="hidden max-w-[180px] flex-shrink-0 overflow-hidden rounded-l-[8px]   sm:flex md:max-w-[257px]">
          <img
            width={600}
            height={600}
            src={projectImage}
            className="aspect-video h-full object-cover"
          />
        </div>

        <div className=" w-full  items-center rounded-l-[8px] rounded-r-[8px] bg-background2 px-4 py-4   sm:rounded-l-none sm:px-2 md:px-6 md:py-6">
          <div className="flex gap-x-2">
            {twitterLink && (
              <a href={twitterLink}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.63636 3H3L14.3636 18H18L6.63636 3Z"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5303 3.53033C18.8232 3.23744 18.8232 2.76256 18.5303 2.46967C18.2374 2.17678 17.7626 2.17678 17.4697 2.46967L18.5303 3.53033ZM17.4697 2.46967L11.4697 8.46967L12.5303 9.53033L18.5303 3.53033L17.4697 2.46967Z"
                    fill="#687076"
                  />
                  <path
                    d="M9 12L3 18"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}

            {githubLink && (
              <a href={githubLink}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3308 18.3557V15.964C13.3621 15.5666 13.3084 15.1672 13.1733 14.7922C13.0382 14.4172 12.8249 14.0752 12.5475 13.789C15.1641 13.4973 17.9141 12.5057 17.9141 7.95568C17.9139 6.7922 17.4664 5.67335 16.6641 4.83068C17.044 3.81277 17.0171 2.68764 16.5891 1.68901C16.5891 1.68901 15.6058 1.39735 13.3308 2.92235C11.4208 2.4047 9.40745 2.4047 7.49746 2.92235C5.22246 1.39735 4.23913 1.68901 4.23913 1.68901C3.81111 2.68764 3.78425 3.81277 4.16413 4.83068C3.3559 5.6796 2.9079 6.80857 2.91413 7.98068C2.91413 12.4973 5.66413 13.489 8.28079 13.814C8.00662 14.0973 7.79518 14.4352 7.66022 14.8056C7.52525 15.176 7.4698 15.5707 7.49746 15.964V18.3557"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.4974 16.689C4.9974 17.5 2.91406 16.689 1.66406 14.189"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}

            {discordLink && (
              <a href={discordLink}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.58594 13.3333C8.7526 15.4166 11.2526 15.4166 15.4193 13.3333"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.9167 14.5833L13.75 16.25C13.75 16.25 17.2261 15.1431 18.3333 13.3333C18.3333 12.5 18.7751 6.54447 15.8333 4.58331C14.5833 3.74998 12.5 3.33331 12.5 3.33331L11.6667 4.99998H10"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.10677 14.5833L6.27344 16.25C6.27344 16.25 2.79733 15.1431 1.6901 13.3333C1.6901 12.5 1.24836 6.54447 4.1901 4.58331C5.4401 3.74998 7.52344 3.33331 7.52344 3.33331L8.35677 4.99998H10.0234"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.08594 11.6666C6.39558 11.6666 5.83594 10.9205 5.83594 9.99998C5.83594 9.07951 6.39558 8.33331 7.08594 8.33331C7.77629 8.33331 8.33594 9.07951 8.33594 9.99998C8.33594 10.9205 7.77629 11.6666 7.08594 11.6666Z"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.9141 11.6666C12.2237 11.6666 11.6641 10.9205 11.6641 9.99998C11.6641 9.07951 12.2237 8.33331 12.9141 8.33331C13.6044 8.33331 14.1641 9.07951 14.1641 9.99998C14.1641 10.9205 13.6044 11.6666 12.9141 11.6666Z"
                    stroke="#687076"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
          </div>

          <h3 className="mt-3 text-[10px] font-bold md:text-xs">{title}</h3>

          <div className="   ">
            <p className="mt-2 line-clamp-2   text-[10px] ">{description}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

const SearchIcon = () => {
  return (
    <>
      <div className="hidden md:block">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.498 15.5L18.998 19"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M5 11C5 14.3137 7.68629 17 11 17C12.6597 17 14.1621 16.3261 15.2483 15.237C16.3308 14.1517 17 12.654 17 11C17 7.68629 14.3137 5 11 5C7.68629 5 5 7.68629 5 11Z"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>

      <div className="block md:hidden">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.334 10.333L12.6673 12.6663"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M3.33398 7.33301C3.33398 9.54215 5.12485 11.333 7.33398 11.333C8.44047 11.333 9.44202 10.8837 10.1662 10.1577C10.8878 9.43411 11.334 8.43566 11.334 7.33301C11.334 5.12387 9.54312 3.33301 7.33398 3.33301C5.12485 3.33301 3.33398 5.12387 3.33398 7.33301Z"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
    </>
  );
};
