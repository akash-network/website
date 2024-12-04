import { ArrowUpRight } from "lucide-react";

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

        <div className="absolute bottom-[4.5%] left-[0.6%] right-[2.6%] top-[0.6%]  flex items-center justify-center rounded bg-black bg-opacity-40 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-12 w-12 text-white opacity-80 transition-transform group-hover:scale-110" />
        </div>
      </a>
    </div>
  );
};

export default AktFeatures;
