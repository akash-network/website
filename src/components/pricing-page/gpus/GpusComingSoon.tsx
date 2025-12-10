import NvidiaBlackwellForm from "@/components/blackwell/nvidia-blackwell-form";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";

const GpusComingSoon = () => {
  const description =
    "Supercharge your AI and compute workloads with NVIDIA's most advanced GPUs, coming soon to Akash Supercloud.";

  return (
    <>
      <div className="my-4 flex flex-col items-center justify-between rounded-lg border border-[#3C3C3C] bg-black p-4 text-white shadow-lg sm:flex-row sm:gap-5 md:my-0">
        <div className="flex items-center gap-5">
          <div className="flex  items-center justify-center rounded-md border border-[#3C3C3C] px-3 py-2.5">
            <svg
              width="42"
              height="28"
              viewBox="0 0 42 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_195_262)">
                <path
                  d="M15.6124 8.26136V5.76096C15.8556 5.74307 16.1006 5.73055 16.351 5.7234C23.1923 5.50877 27.6798 11.6006 27.6798 11.6006C27.6798 11.6006 22.8328 18.3328 17.6352 18.3328C16.8858 18.3328 16.2169 18.2129 15.6124 18.009V10.4255C18.2755 10.7475 18.8103 11.9243 20.4128 14.5929L23.9739 11.5899C23.9739 11.5899 21.3751 8.18088 16.9931 8.18088C16.5156 8.18088 16.0613 8.21486 15.6141 8.26315M15.6124 0V3.7363C15.8574 3.71663 16.1042 3.70053 16.351 3.69159C25.8644 3.37144 32.0617 11.4933 32.0617 11.4933C32.0617 11.4933 24.9433 20.1499 17.5261 20.1499C16.8465 20.1499 16.2097 20.0873 15.6124 19.9818V22.2908C16.1239 22.3552 16.6533 22.3946 17.206 22.3946C24.108 22.3946 29.0981 18.8711 33.9326 14.6984C34.7339 15.3405 38.0141 16.9001 38.6884 17.5851C34.0918 21.4323 23.3836 24.5319 17.3133 24.5319C16.7284 24.5319 16.165 24.4961 15.6141 24.4443V27.6905H41.8452V0H15.6124ZM15.6124 18.009V19.98C9.22898 18.8425 7.4583 12.2069 7.4583 12.2069C7.4583 12.2069 10.5221 8.81045 15.6124 8.26136V10.4237C15.6124 10.4237 15.6052 10.4237 15.6016 10.4237C12.9313 10.1036 10.844 12.5986 10.844 12.5986C10.844 12.5986 12.0138 16.8 15.6124 18.009ZM4.27466 11.9208C4.27466 11.9208 8.05747 6.33866 15.6124 5.76096V3.7363C7.24546 4.40702 0 11.4933 0 11.4933C0 11.4933 4.10296 23.3568 15.6124 24.4425V22.2891C7.16676 21.2266 4.27466 11.919 4.27466 11.919V11.9208Z"
                  fill="#8DC63F"
                />
              </g>
              <defs>
                <clipPath id="clip0_195_262">
                  <rect width="41.8434" height="27.6887" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white ">
              NVIDIA B200 – B300 Coming Soon
            </h3>
            <p className="hidden text-sm text-[#8F8F8F] sm:block">
              {description}
            </p>
          </div>
        </div>
        <p className="mb-5 mt-4 text-sm text-[#8F8F8F] sm:hidden">
          {description}
        </p>
        <NvidiaBlackwellForm>
          <button
            className={buttonVariants({
              variant: "primary",
              className:
                "flex w-fit items-center gap-2 whitespace-nowrap !px-4 !py-3",
            })}
          >
            Request Access
            <ArrowUpCircle className="h-4 w-4 rotate-45" />
          </button>
        </NvidiaBlackwellForm>
      </div>
    </>
  );
};

export default GpusComingSoon;

export const NVIDIAB200SoonForm = ({
  children,
  externalButton,
}: {
  children?: React.ReactNode;
  externalButton?: boolean;
}) => {
  const button = (
    <button className="flex w-full items-center justify-center bg-primary px-3 py-2">
      <div>
        <p className="text-center text-sm font-semibold text-white ">
          NVIDIA B200/300 are coming to Akash -{" "}
          <span className="underline">Get Early Access</span>
        </p>
      </div>
    </button>
  );

  return (
    // <NvidiaBlackwellForm>
    //   {externalButton ? button : children}
    // </NvidiaBlackwellForm>

    <a href="/nvidia-blackwell-gpus">{button}</a>
  );
};
