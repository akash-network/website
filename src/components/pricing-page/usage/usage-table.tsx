import { gpus } from "@/utils/api";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import akashLogo from "../../../assets/akash-logo-primary.svg";
import awsLogo from "../../../assets/aws-logo.svg";
import azureLogo from "../../../assets/azure-logo.svg";
import gcpLogo from "../../../assets/gcp-logo.svg";
import arrowUpRight from "../../../assets/icons/arrow-up-right.svg";
import SpeakToExpert from "../SpeakToExpert";
import CompareItem from "./compare-item";
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

const DEFAULT_USAGE = {
  cpu: 20,
  memory: 128,
  ephemeralStorage: 256,
  persistentStorage: 256,
};

const MAX_VALUE = {
  cpu: 100,
  memory: 1024,
  ephemeralStorage: 10240,
  persistentStorage: 10240,
};

const AKASH_DEFAULT_PRICE = {
  cpu: 1.6,
  memory: 0.8,
  ephemeralStorage: 0.02,
  persistentStorage: 0.04,
};

const AWS_DEFAULT_PRICE = {
  cpu: 2.5,
  memory: 1.2,
  ephemeralStorage: 0.03,
  persistentStorage: 0.04,
};

const GCP_DEFAULT_PRICE = {
  cpu: 2,
  memory: 1,
  ephemeralStorage: 0.025,
  persistentStorage: 0.04,
};

const AZURE_DEFAULT_PRICE = {
  cpu: 2.1,
  memory: 1.1,
  ephemeralStorage: 0.02,
  persistentStorage: 0.044,
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
  const [isMobile, setIsMobile] = useState(false);
  const [akashCost, setAkashCost] = useState<number>(0);
  const [awsCost, setAwsCost] = useState<number>(0);
  const [gcpCost, setGcpCost] = useState<number>(0);
  const [azureCost, setAzureCost] = useState<number>(0);
  const [savingPercent, setSavingPercent] = useState<number>(0);

  const [cpu, setCpu] = useState<number>(DEFAULT_USAGE.cpu);
  const [memory, setMemory] = useState<number>(DEFAULT_USAGE.memory);
  const [ephemeralStorage, setEphemeralStorage] = useState<number>(
    DEFAULT_USAGE.ephemeralStorage,
  );
  const [persistentStorage, setPersistentStorage] = useState<number>(
    DEFAULT_USAGE.persistentStorage,
  );

  const mock = {
    cost: 5.12,
    percent: -83.55,
  };

  useEffect(() => {
    setAkashCost(
      cpu * AKASH_DEFAULT_PRICE.cpu +
        memory * AKASH_DEFAULT_PRICE.memory +
        ephemeralStorage * AKASH_DEFAULT_PRICE.ephemeralStorage +
        persistentStorage * AKASH_DEFAULT_PRICE.persistentStorage,
    );
    setAwsCost(
      cpu * AWS_DEFAULT_PRICE.cpu +
        memory * AWS_DEFAULT_PRICE.memory +
        ephemeralStorage * AWS_DEFAULT_PRICE.ephemeralStorage +
        persistentStorage * AWS_DEFAULT_PRICE.persistentStorage,
    );
    setGcpCost(
      cpu * GCP_DEFAULT_PRICE.cpu +
        memory * GCP_DEFAULT_PRICE.memory +
        ephemeralStorage * GCP_DEFAULT_PRICE.ephemeralStorage +
        persistentStorage * GCP_DEFAULT_PRICE.persistentStorage,
    );
    setAzureCost(
      cpu * AZURE_DEFAULT_PRICE.cpu +
        memory * AZURE_DEFAULT_PRICE.memory +
        ephemeralStorage * AZURE_DEFAULT_PRICE.ephemeralStorage +
        persistentStorage * AZURE_DEFAULT_PRICE.persistentStorage,
    );
  }, [cpu, memory, ephemeralStorage, persistentStorage]);

  useEffect(() => {
    const maxCost = Math.max(...[awsCost, gcpCost, azureCost]);
    setSavingPercent(((maxCost - akashCost) * 100) / maxCost);
  }, [akashCost, awsCost, gcpCost, azureCost]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      className={clsx(
        "mx-auto flex w-full max-w-[1380px] flex-col-reverse gap-10 md:flex-row",
        subCom ? "" : "",
      )}
    >
      <div className={clsx("flex flex-col gap-8 ")}>
        <div className="flex w-full flex-col gap-5  rounded-md border bg-background2 p-6 shadow-sm md:w-[274px]">
          <p className="font-semibold text-cardGray">
            Price estimate <span className="text-xs">(USD per month)</span>
          </p>
          <div className="">
            <div className="flex items-center gap-4 border-b pb-2">
              <img src={akashLogo.src} alt="akash-logo" />
              <p className="font-semibold text-black dark:text-white">
                Akash Network
              </p>
            </div>
            <div className="flex justify-between md:block">
              <div className="flex flex-grow items-center justify-between pr-2 pt-2 md:pr-0">
                <p className="text-sm font-medium">Estimated Cost:</p>
                <p className="hidden text-[21px] font-semibold leading-[28px] text-black dark:text-white md:block">
                  ${akashCost.toFixed(2)}
                </p>
                <p className="text-[21px] font-semibold leading-[28px] text-black dark:text-white md:hidden">
                  ${akashCost.toFixed(0)}
                </p>
              </div>
              <div className="flex items-center justify-end pt-[5px]">
                <p className="rounded-full bg-success-light px-2.5 py-1 text-sm font-medium text-success-dark dark:bg-success-dark dark:text-success-light">
                  {savingPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <a
              id={"usage"}
              href={"https://console.akash.network/"}
              target="_blank"
              className="flex justify-center gap-1.5 rounded-md bg-primary px-4 py-2 hover:bg-darkGray dark:hover:bg-background"
            >
              <p className="font-medium leading-[24px] text-white">
                Deploy Now
              </p>
              <img src={arrowUpRight.src} alt="" />
            </a>
            <div className="md:hidden">
              <SpeakToExpert />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5  rounded-md border bg-background2 p-6 shadow-sm md:w-[274px]">
          <p className="font-semibold text-cardGray">Price compare</p>
          <div className="flex flex-col gap-5">
            <CompareItem title="AWS" cost={awsCost} logo={awsLogo.src} />
            <CompareItem title="GCP" cost={gcpCost} logo={gcpLogo.src} />
            <CompareItem title="Azure" cost={azureCost} logo={azureLogo.src} />
          </div>
        </div>
        <div className="hidden md:block">
          <SpeakToExpert />
        </div>
      </div>

      <div className="flex w-full flex-col gap-6  rounded-md border bg-background2 p-6 shadow-sm">
        <div className="flex flex-col gap-1 pb-4 md:pb-8">
          <h1 className="!font-semibold">Usage estimate</h1>
          <p className="text-cardGray">
            Estimate your costs by selecting the resources you need. Adjust CPU,
            memory, storage, and other parameters to get a detailed cost
            breakdown.
          </p>
        </div>
        <UsageAmount
          title="CPU"
          max={MAX_VALUE.cpu}
          defaultValue={DEFAULT_USAGE.cpu}
          suffix="vCPUs"
          amount={cpu}
          setAmount={setCpu}
          content="(Amount of vCPU's)"
        />
        <UsageAmount
          title={
            <>
              Memory <span className="text-sm md:hidden">(GB)</span>
            </>
          }
          max={MAX_VALUE.memory}
          amount={memory}
          setAmount={setMemory}
          defaultValue={DEFAULT_USAGE.memory}
          suffix="GB"
          content="(Amount of memory)"
        />
        <UsageAmount
          title={
            <>
              Ephemeral Storage <span className="text-sm md:hidden">(GB)</span>
            </>
          }
          amount={ephemeralStorage}
          setAmount={setEphemeralStorage}
          max={isMobile ? 1024 : MAX_VALUE.ephemeralStorage}
          defaultValue={DEFAULT_USAGE.ephemeralStorage}
          suffix="GB"
          content="(Amount of ephemeral disk storage)"
        />
        <UsageAmount
          title={
            <>
              Persistent Storage <span className="text-sm md:hidden">(GB)</span>
            </>
          }
          amount={persistentStorage}
          setAmount={setPersistentStorage}
          max={isMobile ? 1024 : MAX_VALUE.persistentStorage}
          defaultValue={DEFAULT_USAGE.persistentStorage}
          suffix="GB"
          content="(Amount of persistent disk storage)"
        />
        <div className="flex justify-end">
          <Disclaimer />
        </div>
      </div>
    </section>
  );
};
