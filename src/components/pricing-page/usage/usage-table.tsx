import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { gpus } from "@/utils/api";
import clsx from "clsx";
import { Skeleton } from "../../ui/skeleton";
import arrowUpRight from '../../../assets/icons/arrow-up-right.svg';
import Compare from "./compare";
import akashLogo from '../../../assets/akash-logo-primary.svg'
import ProgressBar from "./progress-bar";
import Disclaimer from "./disclaimer";
import UsageAmount from "./usage-amount";
export interface Gpus {
  availability: { total: number; available: number };
  models: Array<{
    vendor: string;
    model: string;
    ram: string;
    interface: string;
    availability: { total: number; available: number };
    providerAvailability: { total: number; available: number };
    price: {
      min: number;
      max: number;
      avg: number;
      med: number;
      weightedAverage: number;
    };
  }>;
  time?: number;
}

const UsageTable = ({
  initialData,
  pathName,
  subCom,
}: {
  initialData?: any;
  pathName?: any;
  subCom?: boolean;
}) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Table
        initialData={{
          data: initialData,
        }}
        pathName={pathName}
        subCom={subCom}
      />
    </QueryClientProvider>
  );
};

export default UsageTable;

const Table = ({
  initialData,
  pathName,
  subCom,
}: {
  initialData?: {
    data: any;
  };
  pathName?: any;
  subCom?: boolean;
}) => {
  const fetchInterval = 1000 * 60;

  const {
    data: result,
    isLoading,
    isFetching,
    isInitialLoading,
  } = useQuery<
    {
      data: Gpus;
    },
    Error
  >({
    queryKey: ["GPU_TABLE"],
    queryFn: () => axios.get(gpus),
    refetchIntervalInBackground: true,

    refetchInterval: fetchInterval,
  });

  const data = result?.data;
  return (
    <Tables
      data={data}
      subCom={subCom}
      pathName={pathName}
      isLoading={isLoading || isInitialLoading}
    />
  );
};

export const Tables = ({
  data,
  pathName,
  subCom,
  isLoading,
}: {
  data?: Gpus;
  pathName?: any;
  subCom?: boolean;
  isLoading?: boolean;
}) => {

  const mock = {
    cost: 5.12,
    percent: - 83.55
  }

  const [progress, setProgress] = useState<number>(60);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(event.target.value));
  };

  return (
    <section
      className={clsx(
        " mx-auto flex max-w-[1380px] gap-10 ",
        subCom ? "" : "container",
      )}
    >
      <div
        className={clsx(
          "flex flex-col gap-8 "
        )}
      >
        <div className="rounded-md border p-6 shadow-sm  flex flex-col gap-5 w-[274px] bg-white">
          <p className="text-sm font-medium">Price estimate</p>
          <div className="">
            <div className="flex gap-4 items-center pb-2 border-b">
              <img src={akashLogo.src} alt="akash-logo" />
              <p className="font-semibold text-black">Akash Network</p>
            </div>
            <div className="flex justify-between pt-2">
              <p className="text-sm font-medium">Estimated Cost:</p>
              <p className="text-[21px] leading-[28px] font-semibold text-black">
                ${mock.cost}
              </p>
            </div>
            <div className="flex justify-end pt-[5px]">
              <p className="px-2.5 py-1 bg-success-light text-success-dark rounded-full text-sm font-medium">
                {mock.percent}
              </p>
            </div>
          </div>
          <a
            id={`usage`}
            href={`#`}
            target="_blank"
            className=" rounded-md bg-primary flex justify-center py-2 px-4 gap-1.5"
          >
            <p className="font-medium text-white leading-[24px]">Deploy Now</p>
            <img src={arrowUpRight.src} alt="" />
          </a>
        </div>
        <div className="rounded-md border p-6 shadow-sm  flex flex-col gap-5 w-[274px] bg-white">
          <p className="text-sm font-medium">Price compare</p>
          <Compare />
        </div>
      </div>
      <div className="w-full">

        <div className="rounded-md border p-6 shadow-sm  flex flex-col gap-6 w-full bg-white">
          <p className="text-sm font-medium">Usage estimate</p>
          <UsageAmount
            title="CPU"
            content="(Amount of vCPU's)" />
          <UsageAmount
            title="Memory"
            content="(Amount of memory)" />
          <UsageAmount
            title="Ephemeral Storage"
            content="(Amount of ephemeral disk storage)" />
          <UsageAmount
            title="Persistent Storage"
            content="(Amount of persistent disk storage)" />
          <div className="flex justify-end">
            <Disclaimer />
          </div>
        </div>
      </div>
    </section >
  );
};
