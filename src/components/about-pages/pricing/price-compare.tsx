import type { Gpus } from "@/components/gpu-table/gpu-table";
import { BASE_API_URL } from "@/lib/constants";
import { bibyteUnits, toBytes } from "@/lib/unit-utils";
import { Listbox, Transition } from "@headlessui/react";
import axios from "axios";
import clsx from "clsx";
import { CheckIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useCustomPricing } from "./CustomPricingContext";
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

export default function PriceCompare({ initialData }: any) {
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
    <div className="grid grid-cols-1 gap-x-3 gap-y-5  md:grid-cols-3">
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
            min={1}
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
            min={1}
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
            min={1}
          />
        </div>
      </div>

      <GpuSelect data={initialData} />
    </div>
  );
}

const GpuSelect = ({ data }: { data: Gpus }) => {
  const [selected, setSelected] = useState(data?.models?.[0]);
  return (
    <div className="w-full md:col-span-3">
      <p className="text-sm font-medium leading-none text-foreground ">GPU</p>
      <div className="my-2 flex  w-full flex-col  rounded-lg border ">
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <>
              <div className="relative w-full ">
                <Listbox.Button className="flex  min-h-[38px]  w-full appearance-none items-start rounded-lg border-b bg-[#F9FAFB] px-[13px] py-[9px] text-sm font-medium leading-normal text-para outline-none dark:bg-background">
                  <span className="">GPU Model</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <svg
                      className="h-3 w-3 fill-current text-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
                    </svg>
                  </span>
                </Listbox.Button>

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-background2 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {data?.models
                      ?.sort(
                        (a, b) =>
                          b.availability.available - a.availability.available,
                      )
                      ?.map((person) => (
                        <Listbox.Option
                          key={person.model}
                          className={({ active }) =>
                            clsx(
                              active ? "bg-background " : "",
                              "relative cursor-default select-none py-2 pl-3 pr-3 text-foreground md:pr-9",
                            )
                          }
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center gap-1.5  md:gap-2">
                                <span className="text-xs font-medium capitalize leading-none text-foreground md:text-sm">
                                  {person.model}
                                </span>
                                <div className="h-5 w-px bg-border"></div>
                                <span className="text-2xs font-medium leading-none text-para md:text-xs">
                                  vRam : {person.ram}
                                </span>
                                <div className="h-5 w-px bg-border"></div>
                                <span className="text-2xs font-medium leading-none text-para md:text-xs">
                                  Interface : {person.interface}
                                </span>
                                <div className="h-5 w-px bg-border"></div>
                                <span className="text-2xs font-medium leading-none  text-foreground md:text-sm">
                                  avg: $
                                  {person?.price?.weightedAverage?.toFixed(2)} /
                                  hr
                                </span>
                              </div>

                              {selected ? (
                                <span
                                  className={clsx(
                                    active ? "text-white" : "text-primary",
                                    "absolute inset-y-0 right-0 hidden items-center pr-4 md:flex",
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
        <div className="flex w-full items-center gap-2 rounded-lg bg-background2 px-[13px] py-[9px] text-sm font-medium leading-none text-gray-400 outline-none">
          <span className="text-xs font-medium capitalize leading-none text-foreground md:text-sm">
            {selected?.model}
          </span>
          <div className="h-5 w-px bg-border"></div>
          <span className="text-2xs font-medium leading-none text-para md:text-xs">
            vRam : {selected?.ram}
          </span>
          <div className="h-5 w-px bg-border"></div>
          <span className="text-2xs font-medium leading-none text-para md:text-xs">
            Interface : {selected?.interface}
          </span>
          <div className="h-5 w-px bg-border"></div>
          <span className="text-2xs font-medium leading-none  text-foreground md:text-sm">
            avg: ${selected?.price?.weightedAverage?.toFixed(2)} / hr
          </span>
        </div>
      </div>
      <a href="/gpus" className="  text-sm font-normal  text-para  underline">
        To explore pricing and availability details of GPU models, please follow
        this link
      </a>
    </div>
  );
};
