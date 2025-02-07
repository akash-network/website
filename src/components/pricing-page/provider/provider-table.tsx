import { Switch } from "@/components/ui/switch";
import { gpus } from "@/utils/api";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import clsx from "clsx";
import _ from "lodash";
import { useEffect, useState } from "react";
import CpuBrand from "../../../assets/cpu-brand.svg";
import EndpointBrand from "../../../assets/endpoint-brand.svg";
import GpuBrand from "../../../assets/gpu-brand.svg";
import arrowUpRight from "../../../assets/icons/arrow-up-right.svg";
import IpsBrand from "../../../assets/ips-brand.svg";
import MemoryBrand from "../../../assets/memory-brand.svg";
import StorageBrand from "../../../assets/storage-brand.svg";
import SpeakToExpert from "../SpeakToExpert";
import MonthEarning from "./month-earning";
import PricingUnit from "./pricing-unit";

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

const ProviderTable = ({
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

export default ProviderTable;

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
  const max = {
    leasePercentInput: 100,
    cpuInput: 100,
    cpuPricing: 5,
    memoryInput: 1024,
    memoryPricing: 5,
    storageInput: 10240,
    storagePricing: 1,
    persistentStorageInput: 10240,
    persistentStoragePricing: 1,
    gpuInput: 100,
    gpuPricing: 1000,
    ipInput: 100,
    ipPricing: 10,
    endpointInput: 100,
    endpointPricing: 1,
  };

  const step = {
    leasePercentInput: 0.5,
    cpuInput: 1,
    cpuPricing: 0.1,
    memoryInput: 1,
    memoryPricing: 0.1,
    storageInput: 1,
    storagePricing: 0.001,
    persistentStorageInput: 1,
    persistentStoragePricing: 0.001,
    gpuInput: 1,
    gpuPricing: 1,
    ipInput: 1,
    ipPricing: 0.1,
    endpointInput: 1,
    endpointPricing: 0.01,
  };
  const [loading, setIsLoading] = useState(false);
  const [loadingDaily, setIsLoadingDaily] = useState(false);
  const [leasePercentInput, setLeasePercentInput] = useState(100);
  const [cpuInput, setCpuInput] = useState(10);
  const [cpuPricing, setCpuPricing] = useState(10);
  const [memoryInput, setMemoryInput] = useState(256);
  const [memoryPricing, setMemoryPricing] = useState(10);
  const [storageInput, setStorageInput] = useState(1024);
  const [storagePricing, setStoragePricing] = useState(10);
  const [persistentStorageInput, setPersistentStorageInput] = useState(1024);
  const [persistentStoragePricing, setPersistentStoragePricing] = useState(10);
  const [gpuInput, setGPUInput] = useState(1);
  const [gpuPricing, setGPUPricing] = useState(1);
  const [ipInput, setIpInput] = useState(1);
  const [ipPricing, setIpPricing] = useState(1);
  const [endpointInput, setEndpointInput] = useState(1);
  const [endpointPricing, setEndpointPricing] = useState(1);

  const [aktAverage, setAktAverage] = useState(true);
  const [usdPrice, setUsdPrice] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);

  const [usdPrices, setUsdPrices] = useState({
    cpuTotalPrice: 0,
    memoryTotalPrice: 0,
    storageTotalPrice: 0,
    persistenStorageTotalPrice: 0,
    gpuTotalPrice: 0,
    ipTotalPrice: 0,
    endpointTotalPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    setIsLoading(true);
    setIsLoadingDaily(true);
    let currentPrice = 0.0;
    let averagePrice = 0.0;
    fetch("https://api.coingecko.com/api/v3/coins/akash-network/tickers")
      .then((response) => response.json())
      .then((data) => {
        for (let i = 0; i < data.tickers.length; i += 1) {
          if (data.tickers[i].market.name === "Coinbase Exchange") {
            currentPrice = data.tickers[i].converted_last.usd;
            setUsdPrice(data.tickers[i].converted_last.usd);
            break;
          }
        }
        setIsLoading(false);
      });
    fetch(
      "https://api.coingecko.com/api/v3/coins/akash-network/market_chart?vs_currency=usd&days=30&interval=daily",
    )
      .then((response) => response.json())
      .then((data) => {
        const mean = _.meanBy(data.prices, (o: [number, number]) => {
          return o[1];
        });
        averagePrice = mean;
        if (currentPrice > averagePrice) {
          setAktAverage(false);
        }
        setMonthlyAverage(mean);
        setIsLoadingDaily(false);
      });
  }, []);

  useEffect(() => {
    const cpuTotalPrice = (cpuInput * cpuPricing) / (100 / leasePercentInput);
    const memoryTotalPrice =
      (memoryInput * memoryPricing) / (100 / leasePercentInput);
    const storageTotalPrice =
      (storageInput * storagePricing) / (100 / leasePercentInput);
    const persistenStorageTotalPrice =
      (persistentStorageInput * persistentStoragePricing) /
      (100 / leasePercentInput);
    const gpuTotalPrice = (gpuPricing * gpuInput) / (100 / leasePercentInput);
    const ipTotalPrice = (ipPricing * ipInput) / (100 / leasePercentInput);
    const endpointTotalPrice =
      (endpointInput * endpointPricing) / (100 / leasePercentInput);

    const totalPrice =
      cpuTotalPrice +
      memoryTotalPrice +
      storageTotalPrice +
      persistenStorageTotalPrice +
      gpuTotalPrice +
      ipTotalPrice +
      endpointTotalPrice;

    setUsdPrices({
      cpuTotalPrice,
      memoryTotalPrice,
      storageTotalPrice,
      persistenStorageTotalPrice,
      gpuTotalPrice,
      ipTotalPrice,
      endpointTotalPrice,
      totalPrice,
    });
  }, [
    cpuInput,
    cpuPricing,
    memoryInput,
    memoryPricing,
    storageInput,
    storagePricing,
    persistentStorageInput,
    persistentStoragePricing,
    gpuInput,
    gpuPricing,
    ipInput,
    ipPricing,
    endpointInput,
    endpointPricing,
    leasePercentInput,
  ]);

  const calculateAKTPrice = (usdValue: any) => {
    return (
      aktAverage ? usdValue / monthlyAverage : usdValue / usdPrice
    ).toFixed(2);
  };

  const onPriceChangeHandle = (value: boolean) => {
    setAktAverage(value);
  };

  const convertPricing = (value: number) => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <section
      className={clsx(
        " mx-auto flex w-full max-w-[1380px]  flex-col-reverse gap-6 md:flex-row lg:gap-10 ",
        subCom ? "" : "container px-0",
      )}
    >
      <div className={clsx("flex flex-col gap-8")}>
        <div className="flex w-full flex-col gap-10  rounded-md border bg-background2 px-4 py-8 text-black shadow-sm dark:text-white md:w-[340px] md:p-6">
          <p className="font-semibold text-cardGray">Estimated Earnings</p>
          <MonthEarning
            size={24}
            suffix=""
            title="Total Monthly Earnings (USD)"
            value={`$${convertPricing(usdPrices?.totalPrice)}`}
            loading={loading || loadingDaily}
          />
          <MonthEarning
            size={24}
            suffix=""
            title="Total Monthly Earnings (AKT)"
            value={`${convertPricing(
              +calculateAKTPrice(usdPrices.totalPrice),
            )} AKT`}
            loading={loading || loadingDaily}
          />
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-[14px] text-foreground">
                Use the 30-Day Average Price of AKT
              </p>
              <p className="text-muted-foreground text-[14px]">
                Average Price for 1 AKT is ${monthlyAverage.toFixed(2)} USD.
              </p>
            </div>
            <Switch
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-[#71717A] data-[state=checked]:dark:bg-white"
              onCheckedChange={onPriceChangeHandle}
              checked={aktAverage}
            />
          </div>
          <div className="flex flex-col gap-3">
            <a
              id={`become-a-provider-(gpus)`}
              href={`/providers/`}
              target="_blank"
              className=" flex justify-center gap-1.5 rounded-md bg-primary px-4 py-2"
            >
              <p className="font-medium leading-[24px] text-white">
                Become a Provider
              </p>
              <img src={arrowUpRight.src} alt="" className="hidden lg:block" />
            </a>
            <div className="md:hidden">
              <SpeakToExpert />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-10  rounded-md border bg-background2 px-4 py-8 shadow-sm md:w-[340px] md:p-6">
          <p className="font-semibold text-cardGray">Estimated Breakdown</p>
          <MonthEarning
            size={20}
            title="Total CPU Earnings"
            value={`$${usdPrices.cpuTotalPrice.toFixed(2)}`}
          />
          <MonthEarning
            size={20}
            title="Total Memory Earnings"
            value={`$${usdPrices.memoryTotalPrice.toFixed(2)}`}
          />
          <MonthEarning
            size={20}
            title="Total Storage Earnings"
            value={`$${usdPrices.storageTotalPrice.toFixed(2)}`}
          />
          <MonthEarning
            size={20}
            title="Total Persistent Storage Earnings"
            value={`$${usdPrices.persistenStorageTotalPrice.toFixed(2)}`}
          />
          <MonthEarning
            size={20}
            title="Total GPU Earnings"
            value={`$${usdPrices.gpuTotalPrice.toFixed(2)}`}
          />
          <MonthEarning
            size={20}
            title="Total IP Earnings"
            value={`$${usdPrices.ipTotalPrice.toFixed(2)}`}
          />
          <MonthEarning
            size={20}
            title="Total Endpoint Earnings"
            value={`$${usdPrices.endpointTotalPrice.toFixed(2)}`}
          />
        </div>
        <div className="hidden md:block">
          <SpeakToExpert />
        </div>
      </div>

      <div className="flex w-full  flex-col md:gap-4 md:rounded-md md:border md:bg-background2 md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-1 pb-8 md:border-b">
          <h1 className="!font-semibold ">Provider Earn Calculator</h1>
          <p className="text-muted-foreground">
            Calculate your potential earnings by providing resources to the
            Akash Network.
          </p>
        </div>
        <div className="rounded-md border bg-background2 px-4 py-4 md:rounded-none md:border-b md:border-l-0 md:border-r-0 md:border-t-0 md:px-0 md:pb-7">
          <PricingUnit
            title="Provider Utilization"
            content="Usage % (Leases in your provider)"
            position="items-center"
            max={max.leasePercentInput}
            step={step.leasePercentInput}
            progress={leasePercentInput}
            setProgress={setLeasePercentInput}
            suffix="%"
            flag={true}
          />
        </div>
        <div className="mt-8 rounded-md border bg-background2 px-4 pb-8 pt-8 md:mt-0 md:border-none md:px-0 md:pb-0  ">
          <p className="font-semibold text-black dark:text-white">
            Resources pricing
          </p>
          <p className="font-medium">Usage % (Leases in your provider)</p>
          <div className="flex flex-col gap-7">
            <div className="flex items-start justify-between gap-6 border-b py-7 md:gap-8 xl:gap-10">
              <img src={CpuBrand.src} alt="CPU" className="hidden lg:block" />
              <PricingUnit
                title="CPU"
                content="vCPU"
                max={max.cpuInput}
                step={step.cpuInput}
                progress={cpuInput}
                suffix=""
                setProgress={setCpuInput}
              />
              <PricingUnit
                title="CPU Pricing"
                content="USD / thread-month"
                max={max.cpuPricing}
                step={step.cpuPricing}
                progress={cpuPricing}
                setProgress={setCpuPricing}
              />
            </div>
            <div className="flex items-start justify-between gap-6 border-b pb-7 md:gap-8 xl:gap-10">
              <img src={MemoryBrand.src} alt="" className="hidden lg:block" />
              <PricingUnit
                title="Memory"
                content="Gi"
                max={max.memoryInput}
                step={step.memoryInput}
                progress={memoryInput}
                setProgress={setMemoryInput}
              />
              <PricingUnit
                title="Memory Pricing"
                content="USD / GB-month"
                max={max.memoryPricing}
                step={step.memoryPricing}
                progress={memoryPricing}
                setProgress={setMemoryPricing}
              />
            </div>
            <div className="flex items-start justify-between gap-6 border-b pb-7 md:gap-8 xl:gap-10">
              <img src={StorageBrand.src} alt="" className="hidden lg:block" />
              <PricingUnit
                title="Ephemeral Storage"
                content="Gi"
                max={max.storageInput}
                step={step.storageInput}
                progress={storageInput}
                setProgress={setStorageInput}
              />
              <PricingUnit
                title="Storage Pricing"
                content="USD / GB-month"
                max={max.storagePricing}
                step={step.storagePricing}
                progress={storagePricing}
                setProgress={setStoragePricing}
              />
            </div>
            <div className="flex items-start justify-between gap-6 border-b pb-7 md:gap-8 xl:gap-10">
              <img src={StorageBrand.src} alt="" className="hidden lg:block" />
              <PricingUnit
                title="Persistent Storage"
                content="Gi"
                max={max.persistentStorageInput}
                step={step.persistentStorageInput}
                progress={persistentStorageInput}
                setProgress={setPersistentStorageInput}
              />
              <PricingUnit
                title="Storage Pricing"
                content="USD / GB-month"
                max={max.persistentStoragePricing}
                step={step.persistentStoragePricing}
                progress={persistentStoragePricing}
                setProgress={setPersistentStoragePricing}
              />
            </div>
            <div className="flex items-start justify-between gap-6 border-b pb-7 md:gap-8 xl:gap-10">
              <img src={GpuBrand.src} alt="" className="hidden lg:block" />
              <PricingUnit
                title="GPUs"
                content="Unit"
                max={max.gpuInput}
                step={step.gpuInput}
                progress={gpuInput}
                setProgress={setGPUInput}
              />
              <PricingUnit
                title="GPU Pricing"
                content="GPU pricing per Unit"
                max={max.gpuPricing}
                step={step.gpuPricing}
                progress={gpuPricing}
                setProgress={setGPUPricing}
              />
            </div>
            <div className="flex items-start justify-between gap-6 border-b pb-7 md:gap-8 xl:gap-10">
              <img src={IpsBrand.src} alt="" className="hidden lg:block" />
              <PricingUnit
                title="IPs"
                content="Unit"
                max={max.ipInput}
                step={step.ipInput}
                progress={ipInput}
                setProgress={setIpInput}
              />
              <PricingUnit
                title="IP Pricing"
                content="USD / unit-month"
                max={max.ipPricing}
                step={step.ipPricing}
                progress={ipPricing}
                setProgress={setIpPricing}
              />
            </div>
            <div className="flex items-start justify-between gap-10">
              <img src={EndpointBrand.src} alt="" className="hidden lg:block" />
              <PricingUnit
                title="Endpoints"
                content="Unit"
                max={max.endpointInput}
                step={step.endpointInput}
                progress={endpointInput}
                setProgress={setEndpointInput}
              />
              <PricingUnit
                title="Endpoint Pricing"
                content="USD / port-month"
                max={max.endpointPricing}
                step={step.endpointPricing}
                progress={endpointPricing}
                setProgress={setEndpointPricing}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
