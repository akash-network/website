import { BASE_API_URL } from "@/lib/constants";
import axios from "axios";
import { useEffect, useState } from "react";
const isProd = import.meta.env.PROD;

type Pricing = {
  akash: number;
  aws: number;
  gcp: number;
  azure: number;
};

export default function PriceChart() {
  const [config1, setconfig1] = useState<Pricing>();
  const [config2, setconfig2] = useState<Pricing>();
  const [config3, setconfig3] = useState<Pricing>();
  const [config4, setconfig4] = useState<Pricing>();
  const [config5, setconfig5] = useState<Pricing>();

  useEffect(() => {
    (async () => {
      if (isProd) {
        const config1Res = await axios.post(BASE_API_URL + "/pricing", {
          cpu: 1000,
          memory: 1000000000,
          storage: 1000000000,
        });

        setconfig1(config1Res.data);

        const config2Res = await axios.post(BASE_API_URL + "/pricing", {
          cpu: 1000,
          memory: 2000000000,
          storage: 1000000000,
        });

        setconfig2(config2Res.data);

        const config3Res = await axios.post(BASE_API_URL + "/pricing", {
          cpu: 2000,
          memory: 4000000000,
          storage: 1000000000,
        });

        setconfig3(config3Res.data);

        const config4Res = await axios.post(BASE_API_URL + "/pricing", {
          cpu: 2000,
          memory: 8000000000,
          storage: 1000000000,
        });

        setconfig4(config4Res.data);

        const config5Res = await axios.post(BASE_API_URL + "/pricing", {
          cpu: 2000,
          memory: 16000000000,
          storage: 1000000000,
        });

        setconfig5(config5Res.data);
      } else {
        setconfig1({
          akash: 5.83,
          aws: 32.82,
          gcp: 36.14,
          azure: 39.37,
        });

        setconfig2({
          akash: 7.08,
          aws: 36.06,
          gcp: 39.74,
          azure: 43.26,
        });

        setconfig3({
          akash: 14.08,
          aws: 72.13,
          gcp: 79.44,
          azure: 86.52,
        });

        setconfig4({
          akash: 19.08,
          aws: 85.12,
          gcp: 93.82,
          azure: 102.08,
        });

        setconfig5({
          akash: 29.08,
          aws: 111.09,
          gcp: 122.59,
          azure: 133.21,
        });
      }
    })();
  }, []);

  return (
    <div className="rounded-lg md:border md:border-[#D9D9D9] md:p-5">
      <h3 className="mt-5 text-center  text-xl   font-bold lg:text-2xl">
        Benefits (to the user) of Akash’s Supercloud
      </h3>
      <p className="mt-2 text-center text-3xs text-foreground lg:text-base">
        A simple price comparison - $USD price per month
      </p>

      <div className="mt-8 flex w-full justify-between gap-x-3">
        <div className="col-span-3 w-full   rounded-lg border border-[#808080] bg-[#FBF8F7] p-2 md:p-[10px] lg:w-[50%]">
          <div className="grid grid-cols-3 gap-x-1">
            <p className="text-xs  font-bold   text-foreground md:text-2xs">
              vCPUs
            </p>
            <p className="text-xs font-bold text-foreground md:text-2xs">
              Memory
            </p>
            <p className="text-xs font-bold text-foreground md:text-2xs">
              Storage
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2">
            <Column>01</Column>
            <Column>01 GB</Column>
            <Column>01 GB</Column>

            <Column>01</Column>
            <Column>02 GB</Column>
            <Column>01 GB</Column>

            <Column>02</Column>
            <Column>04 GB</Column>
            <Column>01 GB</Column>

            <Column>02</Column>
            <Column>08 GB</Column>
            <Column>01 GB</Column>

            <Column>02</Column>
            <Column>16 GB</Column>
            <Column>01 GB</Column>
          </div>
        </div>
        <div className="col-span-2 hidden  w-[35%] rounded-lg border border-[#808080] bg-[#FFDEDE] p-2 lg:block lg:w-[25%]">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              Akash
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.akash}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.akash}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.akash}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.akash}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.akash}</p>
            </div>
          </div>
        </div>
        <div className="col-span-2 hidden  w-[25%] rounded-lg border border-[#808080]  bg-[#FBF8F7] p-2 lg:block">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              AWS
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.aws}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.aws}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.aws}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.aws}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.aws}</p>
            </div>
          </div>
        </div>
        <div className="col-span-2 hidden  w-[25%] rounded-lg border border-[#808080]  bg-[#FBF8F7] p-2 lg:block">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              GCP
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.gcp}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.gcp}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.gcp}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.gcp}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.gcp}</p>
            </div>
          </div>
        </div>{" "}
        <div className="col-span-2 hidden  w-[25%] rounded-lg border border-[#808080]  bg-[#FBF8F7] p-2 lg:block">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              AZURE
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.azure}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.azure}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.azure}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.azure}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.azure}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 grid w-full grid-cols-2 justify-between gap-5 lg:hidden">
        <div className="rounded-lg border border-[#808080] bg-[#FFDEDE] p-2 ">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              Akash
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.akash}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.akash}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.akash}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.akash}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-foreground  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.akash}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#808080]  bg-[#FBF8F7] p-2">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              AWS
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.aws}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.aws}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.aws}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.aws}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.aws}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#808080]  bg-[#FBF8F7] p-2">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              GCP
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.gcp}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.gcp}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.gcp}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.gcp}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.gcp}</p>
            </div>
          </div>
        </div>{" "}
        <div className="rounded-lg border border-[#808080]  bg-[#FBF8F7] p-2">
          <div className="">
            <p className="text-xs  font-bold  text-foreground md:text-[13px]">
              AZURE
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-1 gap-y-2 ">
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config1?.azure}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config2?.azure}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config3?.azure}</p>
            </div>
            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config4?.azure}</p>
            </div>

            <div className="flex items-center  justify-center rounded-lg border border-[#808080]  bg-white p-[6px]  text-xs  font-bold md:text-xs">
              <p className="text-foreground">$ {config5?.azure}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-center gap-x-3">
        <a className="flex  rounded-lg border border-primary px-2 py-1 text-center text-3xs text-primary lg:px-4 lg:py-1 lg:text-base">
          Lower Cost
        </a>
        <a className="flex  rounded-lg border border-primary px-2 py-1 text-center text-3xs text-primary lg:px-4 lg:py-1 lg:text-base">
          Greater Choice
        </a>{" "}
        <a className="flex  rounded-lg border border-primary px-2 py-1 text-center text-3xs text-primary lg:px-4 lg:py-1 lg:text-base">
          Self-soverign
        </a>{" "}
      </div>

      <div className="mt-3 flex items-center justify-center gap-x-3">
        <a className="flex  rounded-lg border border-primary px-2 py-1 text-center text-3xs text-primary lg:px-4 lg:py-1 lg:text-base">
          Open source
        </a>
        <a className="flex  rounded-lg border border-primary px-2 py-1 text-center text-3xs text-primary lg:px-4 lg:py-1 lg:text-base">
          Community driven
        </a>{" "}
        <a className="flex  rounded-lg border border-primary px-2 py-1 text-center text-3xs text-primary lg:px-4 lg:py-1 lg:text-base">
          Powered by Blockchain Technology ($AKT)
        </a>{" "}
      </div>
    </div>
  );
}

import type { ColumnProps } from "@/types/components";

function Column({ children }: ColumnProps) {
  return (
    <p className="flex items-center  justify-center rounded-lg border border-[#808080] bg-white px-2 py-[6px]  text-xs  font-bold text-foreground md:text-xs">
      {children}
    </p>
  );
}
