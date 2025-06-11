import type { CollectionEntry } from "astro:content";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import DescriptionExpand from "../ecosystem-pages/description-expand";
import { DiscordIcon, GithubIcon, TwitterIcon } from "../header/icons";

type Project = CollectionEntry<"Ecosystem_Page">;

const IntegrationSwiper = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="mt-12 flex w-full select-none flex-col gap-2">
      <h3 className="mb-2 px-5 text-left text-sm  font-medium text-white/60 md:px-14  md:text-base lg:px-[100px] ">
        Explore the Akash Ecosystem
      </h3>
      <Swiper
        spaceBetween={30}
        slidesPerView={1.2}
        slidesOffsetBefore={20}
        slidesOffsetAfter={20}
        breakpoints={{
          640: {
            slidesPerView: 2,
            slidesOffsetBefore: 56,
            slidesOffsetAfter: 56,
          },
          1024: {
            slidesPerView: 2.9,
            slidesOffsetBefore: 100,
            slidesOffsetAfter: 100,
          },
          1280: {
            slidesPerView: 3.9,
            slidesOffsetBefore: 100,
            slidesOffsetAfter: 100,
          },
        }}
        className="w-full [&_.swiper-wrapper]:!flex [&_.swiper-wrapper]:!items-stretch"
      >
        {projects.map((project) => (
          <SwiperSlide key={project.data.projectTitle} className="!h-auto">
            <Card project={project} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default IntegrationSwiper;

const Card = ({ project }: { project: Project }) => {
  const {
    projectImage,
    projectTitle,
    description,
    twitterLink,
    discordLink,
    githubLink,
    websiteLink,
  } = project.data;
  return (
    <div className="flex h-full flex-col rounded-[8px] border bg-background2 px-5 pb-5 pt-5 shadow-sm">
      <div className="overflow-hidden rounded-[4px]">
        <img
          className="w-full transform object-cover"
          src={projectImage.src}
          alt={`banner image for the post`}
        />
      </div>

      <div className="mt-4">
        <h4 className="text-base font-bold leading-normal">{projectTitle}</h4>

        {(twitterLink || discordLink || githubLink || websiteLink) && (
          <div className="mt-4 flex items-center gap-x-4">
            {twitterLink && (
              <a
                href={twitterLink}
                target="_blank"
                className="block cursor-pointer text-lightForeground"
              >
                <TwitterIcon />
              </a>
            )}
            {discordLink && (
              <a
                href={discordLink}
                target="_blank"
                className="block cursor-pointer  text-lightForeground"
              >
                <DiscordIcon />
              </a>
            )}
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                className="block cursor-pointer  text-lightForeground"
              >
                <GithubIcon />
              </a>
            )}
            {websiteLink && (
              <a
                href={websiteLink}
                target="_blank"
                className="block cursor-pointer  text-lightForeground"
              >
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_2861_7799)">
                    <path
                      d="M18.3307 10C18.3307 5.39765 14.5998 1.66669 9.9974 1.66669C5.39502 1.66669 1.66406 5.39765 1.66406 10C1.66406 14.6024 5.39502 18.3334 9.9974 18.3334"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.8359 1.70776C10.8359 1.70776 13.3359 4.99995 13.3359 9.99995"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.16406 18.2921C9.16406 18.2921 6.66406 15 6.66406 9.99995C6.66406 4.99995 9.16406 1.70776 9.16406 1.70776"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.1875 12.9167H9.99616"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.1875 7.08331H17.8048"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M18.2326 14.9311C18.6441 15.1843 18.6188 15.8004 18.195 15.8484L16.0561 16.0909L15.0968 18.0178C14.9067 18.3996 14.3191 18.2127 14.222 17.7394L13.1759 12.6427C13.0938 12.2428 13.4533 11.9911 13.8011 12.205L18.2326 14.9311Z"
                      strokeWidth="1.5"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2861_7799">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
            )}
          </div>
        )}
        <DescriptionExpand description={description} />
      </div>
    </div>
  );
};
