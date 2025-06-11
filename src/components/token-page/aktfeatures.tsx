const AktFeatures = ({
  aktFeaturesSection,
  url,
}: {
  aktFeaturesSection: { title: string; description: string };
  url: string;
}) => {
  const image = `images/token/akt-feat.png`;
  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-14">
      <div className="flex-1">
        <section>
          <h2 className="text-2xl font-semibold md:text-2lg">
            {aktFeaturesSection.title}
          </h2>
          <p className="mt-4 text-sm font-normal md:text-base">
            {aktFeaturesSection.description}
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <p className="text-sm font-normal md:text-base">
            The main features of AKT 2.0 are:
          </p>

          <ul className="ml-5 list-disc space-y-2 text-sm font-normal text-para md:text-base">
            <li>
              Take and Make Fees{" "}
              <a
                target="_blank"
                className="font-medium text-primary"
                href="https://www.mintscan.io/akash/proposals/224"
              >
                (Live now)
              </a>
            </li>
            <li>
              Stable Payment and Settlement{" "}
              <a
                target="_blank"
                className="font-medium text-primary"
                href="https://www.mintscan.io/akash/proposals/228"
              >
                (Live now)
              </a>
            </li>
            <li>Incentive Distribution Pool</li>
            <li>Provider Subsidies</li>
            <li>Public Goods Fund</li>
          </ul>

          <p className="text-sm font-normal leading-normal md:text-base">
            Read the specification and roadmap for AKT2.0{" "}
            <a
              target="_blank"
              className="font-medium text-primary"
              href="https://github.com/akash-network/community/tree/main/sig-economics/akt20-prop"
            >
              here
            </a>
            , and keep up with the latest developments in{" "}
            <a
              target="_blank"
              className="font-medium text-primary"
              href="https://github.com/akash-network/community/tree/main/sig-economics"
            >
              sig-economics
            </a>{" "}
            and{" "}
            <a
              target="_blank"
              className="font-medium text-primary"
              href="https://github.com/orgs/akash-network/discussions/categories/economics"
            >
              GitHub Discussions.
            </a>
          </p>
        </section>
      </div>

      <a
        className="group relative flex-1"
        href={`${url}${image}`}
        target="_blank"
      >
        <img
          alt="Feature illustration"
          src={`/${image}`}
          className={`h-auto w-full transition-all duration-300`}
        />

        <div className="absolute bottom-[4.5%] left-[0.6%] right-[2.4%] top-[0.5%]  flex items-center justify-center rounded-[1%] bg-black bg-opacity-80 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <svg
            width="82"
            height="82"
            viewBox="0 0 82 82"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M27.3333 27.3333H54.6667M54.6667 27.3333V54.6667M54.6667 27.3333L27.3333 54.6667M17.0833 10.25H64.9167C68.6906 10.25 71.75 13.3094 71.75 17.0833V64.9167C71.75 68.6906 68.6906 71.75 64.9167 71.75H17.0833C13.3094 71.75 10.25 68.6906 10.25 64.9167V17.0833C10.25 13.3094 13.3094 10.25 17.0833 10.25Z"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </a>
    </div>
  );
};

export default AktFeatures;
