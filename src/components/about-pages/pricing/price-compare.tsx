import { BASE_API_URL } from "@/lib/constants";
import { bibyteUnits, bytesToShrink, toBytes } from "@/lib/unit-utils";
import { priceCompareCustom } from "@/lib/urlUtils";
import axios from "axios";
import { useEffect, useState } from "react";
import { useCustomPricing } from "./CustomPricingContext";
import { Chip } from "./chip";
const isProd = import.meta.env.PROD;

const mockData = {
  spec: {
    cpu: 1000,
    memory: 2000000000,
    storage: 1000000000,
  },
  akash: 7.08,
  aws: 36.06,
  gcp: 39.74,
  azure: 43.26,
};

export default function PriceCompare() {
  const [selectedCPU, setSelectedCPU] = useState<number>(1);
  const [selectedMemory, setSelectedMemory] = useState<number>(1);
  const [selectedStorage, setSelectedStorage] = useState<number>(1);
  const [selectedMemoryUnit, setSelectedMemoryUnit] = useState<string>("GB");
  const [selectedStorageUnit, setSelectedStorageUnit] = useState<string>("GB");

  const [isLoadingPricing, setIsLoadingPricing] = useState<any>(false);

  const { customPricing, setCustomPricing } = useCustomPricing();

  useEffect(() => {
    (async () => {
      setIsLoadingPricing(true);

      const isMemBibyte = bibyteUnits.some((x) => x === selectedMemoryUnit);
      const isStorageBibyte = bibyteUnits.some(
        (x) => x === selectedStorageUnit,
      );

      console.log({
        cpu: selectedCPU * 1000,
        memory: toBytes(selectedMemory, selectedMemoryUnit, isMemBibyte),
        storage: toBytes(selectedStorage, selectedStorageUnit, isStorageBibyte),
      });

      if (isProd) {
        const response = await axios.post(BASE_API_URL + "/pricing", {
          cpu: selectedCPU * 1000,
          memory: toBytes(selectedMemory, selectedMemoryUnit, isMemBibyte),
          storage: toBytes(
            selectedStorage,
            selectedStorageUnit,
            isStorageBibyte,
          ),
        });

        setCustomPricing(response.data);
      } else {
        setCustomPricing({
          spec: {
            cpu: 1000,
            memory: 50000000000,
            storage: 1000000000,
          },
          akash: 67.08,
          aws: 191.92,
          gcp: 212.34,
          azure: 230.02,
        });
      }

      setIsLoadingPricing(false);
    })();
  }, [
    selectedCPU,
    selectedMemory,
    selectedStorage,
    selectedMemoryUnit,
    selectedStorageUnit,
  ]);

  useEffect(() => {
    if (customPricing) {
    }
  }, [customPricing]);

  const handleCPUChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);

    setSelectedCPU(isNaN(value) ? ("" as any) : value);
  };

  const handleMemoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setSelectedMemory(isNaN(value) ? ("" as any) : value);
  };

  const handleMemoryUnitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    setSelectedMemoryUnit(value);
  };

  const handleStorageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setSelectedStorage(isNaN(value) ? ("" as any) : value);
  };

  const handleStorageUnitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    setSelectedStorageUnit(value);
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5  lg:grid-cols-4">
      <div className="w-full ">
        <p className="text-sm font-medium leading-none text-foreground">CPU</p>
        <div className="mt-2 flex  w-full flex-col overflow-hidden rounded-lg border    shadow-sm">
          <div className="flex min-h-[38px] w-full items-center border-b bg-[#F9FAFB] px-[13px] py-[9px] text-sm font-medium leading-normal text-para outline-none dark:bg-background ">
            No. of CPU
          </div>

          <input
            onChange={handleCPUChange}
            type="number"
            defaultValue="1"
            className="w-full bg-background2 px-[13px] py-[9px] text-sm font-medium leading-none text-foreground outline-none"
          />
        </div>
      </div>

      <div className="w-full">
        <p className="text-sm font-medium leading-none text-foreground">
          Memory
        </p>
        <div className="mt-2 flex  w-full flex-col overflow-hidden rounded-lg border  shadow-sm">
          <div className="relative">
            <select
              className="min-h-[38px] w-full  appearance-none border-b bg-[#F9FAFB] px-[13px] py-[9px] text-sm font-medium leading-normal  text-para outline-none dark:bg-background"
              onChange={handleMemoryUnitChange}
            >
              <option className="text-foreground" value="Gb">
                Memory (GB)
              </option>
              <option className="text-foreground" value="Mb">
                Memory (MB)
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-[13px] flex items-center ">
              <svg
                className="h-3 w-3 fill-current text-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
              </svg>
            </div>
          </div>
          <input
            onChange={handleMemoryChange}
            type="number"
            defaultValue="1"
            className="w-full bg-background2 px-[13px] py-[9px] text-sm font-medium leading-none text-foreground outline-none"
          />
        </div>
      </div>

      <div className="w-full">
        <p className="text-sm font-medium leading-none text-foreground">
          Storage
        </p>
        <div className="mt-2 flex  w-full flex-col overflow-hidden rounded-lg border  shadow-sm">
          <div className="relative">
            <select
              className="min-h-[38px] w-full appearance-none border-b bg-[#F9FAFB] px-[13px] py-[9px] text-sm font-medium leading-normal  text-para outline-none dark:bg-background"
              onChange={handleStorageUnitChange}
            >
              <option className="text-foreground" value="Gb">
                Storage (GB)
              </option>
              <option className="text-foreground" value="Mb">
                Storage (MB)
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-[13px] flex items-center ">
              <svg
                className="h-3 w-3 fill-current text-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
              </svg>
            </div>
          </div>
          <input
            onChange={handleStorageChange}
            type="number"
            defaultValue="1"
            className="w-full bg-background2 px-[13px] py-[9px] text-sm font-medium leading-none text-foreground outline-none"
          />
        </div>
      </div>

      <div className="w-full">
        <p className="text-sm font-medium leading-none text-foreground opacity-30">
          Pricing Coming Soon
        </p>
        <div className="mt-2 flex  w-full flex-col overflow-hidden rounded-lg border  opacity-60">
          <div className="relative ">
            <select
              className="min-h-[38px] w-full appearance-none border-b bg-[#F9FAFB] px-[13px] py-[9px] text-sm font-medium leading-normal text-para outline-none dark:bg-background"
              disabled
            >
              <option className="text-foreground" value="Gb">
                GPU Model
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-[13px] flex items-center ">
              <svg
                className="h-3 w-3 fill-current text-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
              </svg>
            </div>
          </div>
          <input
            type="string"
            defaultValue="A4000"
            className="w-full bg-background2 px-[13px] py-[9px] text-sm font-medium leading-none text-gray-400 outline-none"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function AkashLogo() {
  return (
    <svg
      width="69"
      height="15"
      viewBox="0 0 69 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.9863 9.95898L13.6472 14.6392H8.27208L5.58301 9.95898H10.9863Z"
        fill="url(#paint0_linear_1519_55639)"
      />
      <path
        d="M13.6458 14.6406L16.3304 9.96036L10.9567 0.597656H5.58301L13.6458 14.6406Z"
        fill="#FA7070"
      />
      <path
        d="M2.89607 5.27734H8.26979L2.8983 14.6401L0.209229 9.95983L2.89607 5.27734Z"
        fill="#FA7070"
      />
      <path
        d="M26.4386 4.61702L26.3049 6.06193C25.7319 4.94022 24.4141 4.33184 23.0007 4.33184C20.3458 4.33184 18.5696 6.25205 18.5696 9.1989C18.5696 12.1267 20.1739 14.2561 22.9816 14.2561C24.5096 14.2561 25.6364 13.5146 26.2285 12.545L26.3813 14.0089H28.5587V4.61702H26.4386ZM26.1903 9.31297C26.1903 11.005 25.1398 12.1648 23.5164 12.1648C21.8929 12.1648 20.8997 10.986 20.8997 9.31297C20.8997 7.63992 21.912 6.44217 23.5355 6.44217C25.1589 6.44217 26.1903 7.62091 26.1903 9.31297Z"
        fill="#272540"
      />
      <path
        d="M32.5233 14.0089V11.4803L33.8985 10.0544L36.3623 14.0089H39.0363L35.5219 8.34336L39.1127 4.61702H36.1904L32.5233 8.55249V0.140625H30.2123V14.0089H32.5233Z"
        fill="#272540"
      />
      <path
        d="M46.8614 4.61702L46.7277 6.06193C46.1547 4.94022 44.8368 4.33184 43.4234 4.33184C40.7686 4.33184 38.9923 6.25205 38.9923 9.1989C38.9923 12.1267 40.5967 14.2561 43.4044 14.2561C44.9323 14.2561 46.0592 13.5146 46.6513 12.545L46.8041 14.0089H48.9814V4.61702H46.8614ZM46.6131 9.31297C46.6131 11.005 45.5626 12.1648 43.9391 12.1648C42.3157 12.1648 41.3225 10.986 41.3225 9.31297C41.3225 7.63992 42.3348 6.44217 43.9582 6.44217C45.5817 6.44217 46.6131 7.62091 46.6131 9.31297Z"
        fill="#272540"
      />
      <path
        d="M50.1606 11.1571C50.1606 13.0013 51.6503 14.2561 53.9996 14.2561C56.3297 14.2561 57.9532 13.0773 57.9532 11.1761C57.9532 9.73123 57.151 9.00878 55.5657 8.64755L53.8659 8.2483C53.0637 8.05818 52.6435 7.71597 52.6435 7.18363C52.6435 6.48019 53.1783 6.06193 54.0951 6.06193C54.9927 6.06193 55.5275 6.57525 55.5466 7.37375H57.7622C57.7431 5.5486 56.3106 4.33184 54.1906 4.33184C52.0132 4.33184 50.447 5.43453 50.447 7.27869C50.447 8.78064 51.2683 9.57914 52.9682 9.95938L54.6681 10.3586C55.5084 10.5487 55.7567 10.891 55.7567 11.3663C55.7567 12.0507 55.1646 12.488 54.076 12.488C53.0064 12.488 52.3952 11.9746 52.3761 11.1571H50.1606Z"
        fill="#272540"
      />
      <path
        d="M61.5815 14.0089V8.8757C61.5815 7.46881 62.4409 6.44217 63.9116 6.44217C65.0958 6.44217 65.8789 7.20264 65.8789 8.78063V14.0089H68.209V8.22929C68.209 5.79576 66.9866 4.33184 64.6565 4.33184C63.3004 4.33184 62.1927 4.92121 61.6006 5.83379V0.140625H59.2513V14.0089H61.5815Z"
        fill="#272540"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1519_55639"
          x1="8.63681"
          y1="11.3869"
          x2="13.6382"
          y2="14.6476"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FA5757" />
          <stop
            offset="0.0240912"
            stop-color="#FA5757"
            stop-opacity="0.99831"
          />
          <stop
            offset="0.045037"
            stop-color="#FA5757"
            stop-opacity="0.992615"
          />
          <stop
            offset="0.064967"
            stop-color="#FA5757"
            stop-opacity="0.981977"
          />
          <stop
            offset="0.0860106"
            stop-color="#FA5757"
            stop-opacity="0.96546"
          />
          <stop
            offset="0.110297"
            stop-color="#FA5757"
            stop-opacity="0.942125"
          />
          <stop
            offset="0.139956"
            stop-color="#FA5757"
            stop-opacity="0.911036"
          />
          <stop
            offset="0.177117"
            stop-color="#FA5757"
            stop-opacity="0.871255"
          />
          <stop
            offset="0.223909"
            stop-color="#FA5757"
            stop-opacity="0.821844"
          />
          <stop
            offset="0.282462"
            stop-color="#FA5757"
            stop-opacity="0.761867"
          />
          <stop
            offset="0.354904"
            stop-color="#FA5757"
            stop-opacity="0.690386"
          />
          <stop
            offset="0.443367"
            stop-color="#FA5757"
            stop-opacity="0.606463"
          />
          <stop
            offset="0.549978"
            stop-color="#FA5757"
            stop-opacity="0.509162"
          />
          <stop
            offset="0.676868"
            stop-color="#FA5757"
            stop-opacity="0.397545"
          />
          <stop
            offset="0.826165"
            stop-color="#FA5757"
            stop-opacity="0.270674"
          />
          <stop offset="1" stop-color="#FA5757" stop-opacity="0.127613" />
        </linearGradient>
      </defs>
    </svg>
  );
}
