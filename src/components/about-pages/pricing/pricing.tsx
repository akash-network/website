import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BASE_API_URL } from "@/lib/constants";
import { roundDecimal } from "@/lib/math-helpers";
import { bibyteUnits, bytesToShrink, toBytes } from "@/lib/unit-utils";
import { priceCompareCustom } from "@/lib/urlUtils";
import axios from "axios";
import { useEffect, useState } from "react";
import { FormattedNumber } from "react-intl";
import {
  CustomPricingProvider,
  useCustomPricing,
} from "./CustomPricingContext";
import { Chip } from "./chip";
import PriceChart from "./price-chart";
import PriceCompare from "./price-compare";

export function Pricing({ page, pathName }: any) {
  const { customPricing } = useCustomPricing();
  const [discount, setDiscount] = useState<number>();

  const customPriceAvg = customPricing
    ? roundDecimal(
        (customPricing.aws + customPricing.gcp + customPricing.azure) / 3,
        2,
      )
    : null;

  useEffect(() => {
    const customPriceAvg = customPricing
      ? roundDecimal(
          (customPricing.aws + customPricing.gcp + customPricing.azure) / 3,
          2,
        )
      : null;

    if (customPriceAvg) {
      const discount = (customPricing.akash - customPriceAvg) / customPriceAvg;

      setDiscount(discount);
    }
  }, [customPricing]);

  return (
    <div className="rounded-[8px] border  bg-background2 p-6 shadow-sm">
      <div>
        <h3 className="text-base font-bold leading-normal md:text-xl">
          Calculate your ideal price on Akash
        </h3>
      </div>

      {/* Might Need Later */}
      {/* <div className="mt-6">
        <div className="flex items-center  gap-x-4  rounded-[8px] border px-2 py-2 md:gap-x-8 md:px-6 md:py-6">
          <TabButton
            label="General Purpose"
            link="/about/pricing/compare/"
            isActive={pathName.split("/")[3] === "compare"}
          />
          <TabButton
            label="Custom Calculation"
            isActive={pathName.split("/")[3] === "custom"}
            link="/about/pricing/custom/"
          />
        </div>
      </div> */}

      <div className="mt-8 ">
        {page === "custom" ? (
          <>
            <PriceCompare />
            <div className="my-10 border-b"></div>
            <div>
              <h3 className="text-base font-bold md:text-xl">
                Price comparison - $USD per month
              </h3>
              <div className="mt-4 flex flex-col items-start gap-4 lg:flex-row">
                <div className="w-full  overflow-hidden rounded-lg border  bg-background2 shadow-sm dark:bg-background lg:max-w-[320px]">
                  <div className="flex items-center gap-x-4 px-[20px] py-[18px] md:px-6 md:py-6">
                    <div>
                      <svg
                        width="45"
                        height="42"
                        viewBox="0 0 45 42"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="-ml-1 -mr-1"
                      >
                        <rect
                          y="0.117188"
                          width="44.4671"
                          height="41.7652"
                          rx="6"
                          fill="#FA5757"
                        />
                        <path
                          d="M25.6802 23.9609L29.0586 29.8817H22.2343L18.8203 23.9609H25.6802Z"
                          fill="url(#paint0_linear_1929_78200)"
                        />
                        <path
                          d="M29.0568 29.8824L32.4651 23.9616L25.6427 12.1172H18.8203L29.0568 29.8824Z"
                          fill="white"
                        />
                        <path
                          d="M15.4112 18.0371H22.2336L15.414 29.8815L12 23.9607L15.4112 18.0371Z"
                          fill="white"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_1929_78200"
                            x1="23.498"
                            y1="27.5"
                            x2="29.5027"
                            y2="26.5286"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stop-color="white" />
                            <stop
                              offset="1"
                              stop-color="white"
                              stop-opacity="0"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div>
                      <p className=" text-2xs font-medium leading-none md:text-sm">
                        Akash Network
                      </p>
                      <p className="mt-3  flex  items-end gap-x-2 text-base font-medium leading-none text-rose-500 md:mt-2 md:text-2xl">
                        ${customPricing?.akash}
                        {discount && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20 dark:bg-green-800 dark:text-white">
                            <FormattedNumber
                              style="percent"
                              value={discount}
                              maximumFractionDigits={2}
                            />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="dark:bg-badgeColor bg-gray-50 px-4 py-1 md:px-4 md:py-4">
                    <a className="cursor-pointer  text-2xs font-bold text-rose-500 dark:text-white md:text-sm">
                      Deploy Now
                    </a>
                  </div>
                </div>

                <div className="flex  w-full  flex-col flex-wrap gap-4 lg:flex-row">
                  <HoverCard openDelay={2} closeDelay={2}>
                    <HoverCardTrigger>
                      <PriceCard
                        price={customPricing?.aws}
                        provider="AWS"
                        providerIcon={<AwsIcon />}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent align="center">
                      <div className="w-full p-4 text-xl font-medium">
                        ${customPricing?.aws}
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard openDelay={2} closeDelay={2}>
                    <HoverCardTrigger>
                      <PriceCard
                        price={customPricing?.gcp}
                        provider="GCP"
                        providerIcon={<GCPIcon />}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent align="center">
                      <div className="w-full p-4 text-xl font-medium">
                        ${customPricing?.gcp}
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard openDelay={2} closeDelay={2}>
                    <HoverCardTrigger>
                      <PriceCard
                        price={customPricing?.azure}
                        provider="Azure"
                        providerIcon={<AzureIcon />}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent align="center">
                      <div className="w-full p-4 text-xl font-medium">
                        ${customPricing?.azure}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>
          </>
        ) : (
          <PriceChart />
        )}{" "}
      </div>

      {/* border */}

      {/* Notes div */}
      <div className="mt-10">
        <p className="text-sm font-normal   text-para">
          Disclaimer: <br /> These prices may vary. We strongly suggest that you
          do your own research as we may have miss-calculated some of the
          providers pricing. To calculate the pricing for Akash, we use the same
          calculations from the provider bidding engine in the helm-charts repo
          from Akash. For the other cloud providers, we use the same logic of
          price per GB of ram/storage and price per thread.
          <br />
          <ul className="ml-6 mt-1 list-disc">
            <li>
              <a className="cursor-pointer text-para underline hover:text-primary">
                Amazon Web Service pricing calculator
              </a>
            </li>
            <li>
              {" "}
              <a className="cursor-pointer text-para underline hover:text-primary">
                Google cloud platform pricing
              </a>
            </li>
            <li>
              {" "}
              <a className="cursor-pointer text-para underline hover:text-primary">
                Calculator Microsoft Azure pricing calculator
              </a>
            </li>
          </ul>
        </p>
      </div>
    </div>
  );
}

function TabButton({ props, label, isActive, link }: any) {
  return (
    <a
      href={link}
      className={`rounded-[6px] px-4 py-2 text-2xs  font-medium leading-none  hover:bg-rose-100 md:px-3 md:py-2 md:text-sm ${
        isActive ? "bg-rose-100 text-rose-500" : "text-[#7F7F7F]"
      }`}
    >
      {label}
    </a>
  );
}

function PriceCard({
  provider,
  price,
  providerIcon,
}: {
  provider: string;
  price: string;
  providerIcon: any;
}) {
  return (
    <div className="h-fit min-w-full  overflow-hidden  rounded-lg border   bg-background2 shadow-sm dark:bg-background md:min-w-[195px] ">
      <div className="flex items-center gap-x-4 px-[20px] py-[12px] md:px-[12px] md:py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-background2">
          {providerIcon}
        </div>
        <div>
          <p className=" text-2xs   font-medium leading-none md:text-sm">
            {provider}
          </p>
          <p
            className="mt-2.5 text-base font-medium leading-none text-foreground md:mt-1 md:text-2xl
"
          >
            $
            <FormattedNumber
              value={parseFloat(price)}
              notation="compact"
              maximumFractionDigits={2}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

const AwsIcon = () => {
  return (
    <svg
      width="22"
      height="13"
      viewBox="0 0 22 13"
      fill="currentColor"
      className="text-[#81848B] dark:text-[#BBBBBB]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_2900_74574)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6.12471 4.69014C6.12471 4.9488 6.15265 5.15854 6.20158 5.31234C6.25752 5.46613 6.32744 5.63394 6.42533 5.81568C6.46028 5.87162 6.47426 5.92755 6.47426 5.97649C6.47426 6.04641 6.43233 6.11627 6.34145 6.18622L5.90099 6.47983C5.83805 6.52176 5.77519 6.54277 5.71925 6.54277C5.64933 6.54277 5.57946 6.50783 5.50952 6.44491C5.41166 6.34004 5.32778 6.22817 5.25786 6.1163C5.18794 5.99742 5.11807 5.86464 5.04112 5.70384C4.4958 6.34702 3.81071 6.66858 2.98578 6.66858C2.39858 6.66858 1.93019 6.50077 1.58764 6.16523C1.2451 5.82964 1.07031 5.38223 1.07031 4.82297C1.07031 4.22872 1.28005 3.74636 1.70652 3.38283C2.13299 3.0193 2.69925 2.83756 3.41926 2.83756C3.65694 2.83756 3.90167 2.85849 4.16033 2.89349C4.419 2.92844 4.68467 2.98435 4.96427 3.04729V2.53697C4.96427 2.00563 4.8524 1.63517 4.63566 1.41843C4.41192 1.20169 4.03445 1.09682 3.49613 1.09682C3.25148 1.09682 2.99979 1.12476 2.74113 1.18768C2.48246 1.25059 2.2308 1.32747 1.98612 1.42536C1.87425 1.47429 1.7904 1.50223 1.74147 1.51621C1.69254 1.5302 1.65759 1.53715 1.62959 1.53715C1.53173 1.53715 1.4828 1.46723 1.4828 1.32041V0.977869C1.4828 0.865997 1.49681 0.782144 1.53173 0.733213C1.56665 0.684282 1.62959 0.635351 1.72746 0.58642C1.97211 0.460564 2.26578 0.355697 2.60832 0.271819C2.95091 0.180962 3.31439 0.13901 3.69892 0.13901C4.53085 0.13901 5.13906 0.327755 5.53051 0.705271C5.91503 1.08281 6.11078 1.656 6.11078 2.42502V4.69009H6.12479L6.12474 4.69014H6.12471ZM3.28637 5.75274C3.5171 5.75274 3.75477 5.71082 4.00643 5.62694C4.25809 5.54306 4.48184 5.38926 4.67056 5.17953C4.78243 5.04672 4.86628 4.89987 4.90828 4.73212C4.95021 4.56431 4.97815 4.36158 4.97815 4.1239V3.83029C4.77542 3.78136 4.55869 3.73943 4.33502 3.71142C4.11128 3.68347 3.89461 3.66949 3.67787 3.66949C3.20948 3.66949 2.86693 3.76035 2.63621 3.94914C2.40549 4.13789 2.29367 4.40353 2.29367 4.75308C2.29367 5.08169 2.37754 5.32635 2.55233 5.49408C2.72014 5.66886 2.96479 5.75274 3.2864 5.75274L3.28635 5.75269L3.28637 5.75274ZM8.90003 6.50775C8.77417 6.50775 8.6903 6.48681 8.63436 6.43783C8.57842 6.3959 8.52949 6.29804 8.48757 6.16515L6.84472 0.761207C6.80279 0.621418 6.78178 0.530535 6.78178 0.481604C6.78178 0.369732 6.83771 0.306817 6.94959 0.306817H7.63472C7.76753 0.306817 7.85847 0.327806 7.9074 0.376737C7.96333 0.418663 8.00526 0.516526 8.04719 0.649412L9.22166 5.27734L10.3123 0.649412C10.3472 0.509623 10.3891 0.418689 10.4451 0.376737C10.501 0.334785 10.5989 0.306817 10.7247 0.306817H11.284C11.4168 0.306817 11.5077 0.327806 11.5636 0.376737C11.6196 0.418663 11.6685 0.516526 11.6964 0.649412L12.801 5.33327L14.0104 0.649412C14.0524 0.509623 14.1013 0.418689 14.1502 0.376737C14.2062 0.334811 14.297 0.306817 14.4229 0.306817H15.073C15.1849 0.306817 15.2478 0.362753 15.2478 0.481604C15.2478 0.516551 15.2408 0.551524 15.2338 0.593476C15.2268 0.635428 15.2128 0.691338 15.1849 0.768263L13.5001 6.17221C13.4582 6.312 13.4092 6.40288 13.3533 6.44488C13.2974 6.48681 13.2065 6.5148 13.0876 6.5148H12.4864C12.3536 6.5148 12.2627 6.49382 12.2068 6.44488C12.1509 6.39595 12.1019 6.3051 12.074 6.16523L10.9904 1.6561L9.91375 6.15823C9.87881 6.29801 9.83683 6.3889 9.78089 6.43783C9.72496 6.48676 9.62709 6.50775 9.50129 6.50775H8.90003ZM17.8833 6.69649C17.5198 6.69649 17.1562 6.65457 16.8067 6.57069C16.4571 6.48681 16.1845 6.3959 16.0028 6.29104C15.8909 6.22809 15.814 6.15823 15.786 6.09531C15.7581 6.03237 15.7441 5.9625 15.7441 5.89959V5.54306C15.7441 5.39627 15.8 5.32632 15.9049 5.32632C15.9468 5.32632 15.9888 5.33333 16.0307 5.34731C16.0726 5.36129 16.1356 5.38924 16.2055 5.41723C16.4432 5.5221 16.7018 5.60597 16.9745 5.66188C17.2541 5.71782 17.5268 5.74576 17.8064 5.74576C18.2468 5.74576 18.5894 5.66884 18.8271 5.51504C19.0648 5.36124 19.1906 5.1375 19.1906 4.85092C19.1906 4.65519 19.1277 4.49439 19.0019 4.36158C18.876 4.22872 18.6383 4.10992 18.2958 3.99805L17.2821 3.68345C16.7718 3.52264 16.3943 3.28497 16.1636 2.97039C15.9329 2.6628 15.8141 2.32025 15.8141 1.95672C15.8141 1.66311 15.877 1.40444 16.0028 1.18073C16.1286 0.957008 16.2964 0.761258 16.5062 0.60746C16.7159 0.446657 16.9536 0.327857 17.2332 0.243928C17.5129 0.159998 17.8065 0.125 18.1141 0.125C18.2679 0.125 18.4287 0.132005 18.5825 0.152942C18.7433 0.173931 18.8901 0.201873 19.0369 0.229816C19.1767 0.264763 19.3096 0.299736 19.4354 0.341687C19.5612 0.383639 19.6591 0.425566 19.729 0.467543C19.8268 0.523479 19.8968 0.579415 19.9387 0.642279C19.9806 0.698215 20.0017 0.775139 20.0017 0.873002V1.20161C20.0017 1.34841 19.9457 1.42536 19.8409 1.42536C19.7849 1.42536 19.6941 1.39736 19.5752 1.34143C19.1767 1.15969 18.7292 1.06875 18.2329 1.06875C17.8345 1.06875 17.5199 1.13169 17.3031 1.26448C17.0864 1.39726 16.9745 1.60001 16.9745 1.88667C16.9745 2.0824 17.0444 2.25021 17.1843 2.38301C17.3241 2.51582 17.5827 2.64868 17.9533 2.76748L18.946 3.08208C19.4493 3.24289 19.8129 3.46661 20.0296 3.75321C20.2463 4.03982 20.3512 4.36841 20.3512 4.73194C20.3512 5.03253 20.2882 5.3052 20.1694 5.54288C20.0436 5.78061 19.8758 5.99029 19.6591 6.15807C19.4424 6.33281 19.1837 6.45866 18.8831 6.54955C18.5685 6.64741 18.24 6.69634 17.8834 6.69634L17.8833 6.69647L17.8833 6.69649Z"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M19.2066 10.0937C16.9066 11.7925 13.5649 12.6943 10.6917 12.6943C6.66491 12.6943 3.0367 11.2052 0.296246 8.73048C0.0795077 8.53476 0.275309 8.26909 0.533974 8.42288C3.49811 10.1426 7.15437 11.1843 10.9364 11.1843C13.4881 11.1843 16.2914 10.653 18.871 9.56236C19.2555 9.38757 19.5841 9.81402 19.2066 10.0937V10.0937Z"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M20.1624 9.0031C19.8688 8.62556 18.219 8.82131 17.471 8.91225C17.2472 8.94019 17.2123 8.74444 17.415 8.59764C18.7293 7.67486 20.8895 7.9405 21.1411 8.24812C21.3928 8.56272 21.0712 10.7229 19.8409 11.7575C19.6521 11.9183 19.4703 11.8345 19.5543 11.6247C19.8339 10.9326 20.4561 9.37367 20.1625 9.00313H20.1624V9.0031Z"
        />
      </g>
      <defs>
        <clipPath id="clip0_2900_74574">
          <rect
            width="21.0195"
            height="12.5697"
            fill="white"
            transform="translate(0.203125 0.125)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const GCPIcon = () => {
  return (
    <svg
      width="22"
      height="17"
      viewBox="0 0 22 17"
      fill="currentColor"
      className="text-[#81848B] dark:text-[#BBBBBB]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_2900_74582)">
        <path d="M13.6565 4.60581L14.3201 4.61553L16.1229 2.81269L16.2103 2.04883C14.7797 0.776806 12.8927 0 10.8277 0C7.09252 0 3.93998 2.5408 3.00781 5.98465C3.20525 5.84871 3.62602 5.94904 3.62602 5.94904L7.22846 5.35673C7.22846 5.35673 7.41295 5.04924 7.50682 5.06543C8.35807 4.13002 9.56535 3.59597 10.8309 3.59597C11.899 3.59597 12.883 3.97466 13.6565 4.59934V4.60581Z" />
        <path d="M18.6558 5.99112C18.2383 4.44722 17.3741 3.08457 16.2089 2.04883L13.6551 4.60258C14.6779 5.42794 15.335 6.69025 15.335 8.10468V8.55458C16.5778 8.55458 17.5845 9.56443 17.5845 10.8041C17.5845 12.0437 16.5746 13.0536 15.335 13.0536H10.8327L10.3828 13.5067V16.2094L10.8327 16.656H15.335C18.5652 16.6528 21.1837 14.0343 21.1869 10.8041C21.1869 8.81352 20.1835 7.04952 18.6526 5.98788L18.6558 5.99112Z" />
        <path d="M6.32677 16.6638H10.8258V13.0581H6.32677C6.00634 13.0581 5.69238 12.9901 5.40107 12.8574L4.7505 13.0581L2.94766 14.8609L2.78906 15.4694C3.80538 16.243 5.04828 16.6638 6.32677 16.6638Z" />
        <path d="M6.32851 4.95703C3.09828 4.96027 0.479799 7.57875 0.476562 10.809C0.476562 12.7089 1.38607 14.4017 2.79727 15.4698L5.40605 12.861C4.60011 12.4985 4.079 11.6958 4.079 10.809C4.079 9.56608 5.08885 8.55947 6.32851 8.55947C7.24125 8.55947 8.02453 9.10971 8.38057 9.88652L10.9893 7.27774C9.918 5.86978 8.22844 4.95703 6.32851 4.95703Z" />
      </g>
      <defs>
        <clipPath id="clip0_2900_74582">
          <rect
            width="20.7148"
            height="16.6625"
            fill="white"
            transform="translate(0.476562)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const AzureIcon = () => {
  return (
    <svg
      width="21"
      height="19"
      viewBox="0 0 21 19"
      fill="currentColor"
      className="text-[#81848B] dark:text-[#BBBBBB]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_2900_74589)">
        <path d="M7.46047 0.000484216H13.4236L7.23329 18.3526C7.20165 18.4463 7.15557 18.5346 7.09674 18.6141C7.03807 18.6937 6.96729 18.7635 6.88691 18.8212C6.80653 18.8789 6.71784 18.9237 6.62366 18.9539C6.52948 18.9842 6.43119 18.9998 6.33249 18.9998H1.6916C1.54092 18.9998 1.39235 18.964 1.2583 18.8949C1.12418 18.8261 1.00837 18.7263 0.920482 18.6037C0.832597 18.4811 0.775056 18.3394 0.752701 18.1903C0.730266 18.0412 0.743905 17.8888 0.792004 17.746L6.55942 0.647155C6.5909 0.553459 6.63698 0.465251 6.69597 0.385678C6.75464 0.306105 6.82574 0.236298 6.9058 0.178595C6.98618 0.120893 7.07487 0.0761027 7.16905 0.0458391C7.26323 0.0155756 7.36153 0 7.46023 0V0.000242108L7.46047 0.000484216Z" />
        <path d="M18.4563 19.0002H13.1018C13.0421 19.0002 12.9824 18.9947 12.9235 18.9834C12.8648 18.9723 12.8071 18.9557 12.7514 18.9337C12.6957 18.9118 12.6423 18.8846 12.5917 18.8529C12.5411 18.8209 12.4936 18.7843 12.4499 18.7435L6.37371 13.0688C6.30947 13.0088 6.26468 12.9309 6.24523 12.8451C6.20545 12.6696 6.27711 12.4877 6.42584 12.3864C6.49864 12.337 6.58459 12.3105 6.67247 12.3105H16.1284L18.4559 19.0004L18.4564 19.0002L18.4563 19.0002Z" />
        <path d="M13.4432 1.09527e-05L9.26894 12.3109L16.0893 12.3094L18.4289 18.9992H13.0946C13.0394 18.9987 12.9842 18.9936 12.9299 18.9839C12.8755 18.9741 12.822 18.9597 12.7701 18.9405C12.6661 18.9026 12.5693 18.8472 12.484 18.7765L8.38226 14.9484L7.23402 18.3347C7.20432 18.4194 7.16349 18.4997 7.11256 18.5735C7.01055 18.722 6.8711 18.8408 6.70824 18.9179C6.62714 18.9562 6.54135 18.9835 6.45306 18.9992H1.69265C1.54052 18.9997 1.39034 18.9635 1.25508 18.8934C0.980529 18.7514 0.79233 18.4846 0.750768 18.1782C0.730351 18.0272 0.746491 17.8735 0.797899 17.7301L6.55588 0.659513C6.58582 0.564042 6.63093 0.474139 6.68936 0.392952C6.74754 0.311846 6.81856 0.240263 6.89918 0.18135C6.97981 0.122437 7.06947 0.0765171 7.16445 0.0458501C7.25944 0.0151024 7.35895 -0.000473264 7.45894 1.09527e-05H13.4434H13.4432Z" />
        <path d="M20.8435 17.7455C20.8917 17.8884 20.9051 18.0407 20.883 18.1898C20.8607 18.339 20.8032 18.4806 20.7155 18.6032C20.5372 18.8517 20.2502 18.9991 19.9444 18.9992H13.2983C13.449 18.9992 13.5976 18.9632 13.7319 18.8944C13.8659 18.8256 13.9818 18.7256 14.0697 18.6032C14.1576 18.4808 14.215 18.339 14.2375 18.1898C14.2599 18.0407 14.2463 17.8883 14.1982 17.7455L8.4306 0.646187C8.36709 0.457826 8.24611 0.294161 8.08471 0.178111C8.00457 0.120408 7.91596 0.0758606 7.82194 0.045597C7.72792 0.0153335 7.62971 0 7.53125 0H14.177C14.2758 0 14.3738 0.0153335 14.468 0.045597C14.5619 0.0758606 14.6506 0.120651 14.731 0.178111C14.8111 0.235813 14.8819 0.30554 14.9406 0.384952C14.9992 0.464363 15.0451 0.552491 15.0769 0.646187L20.8445 17.7455H20.8435Z" />
      </g>
      <defs>
        <clipPath id="clip0_2900_74589">
          <rect
            width="20.152"
            height="19"
            fill="white"
            transform="translate(0.742188)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
