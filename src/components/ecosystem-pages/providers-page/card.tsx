import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { roundDecimal } from "@/lib/math-helpers";
import { bytesToShrink } from "@/lib/unit-utils";
import { getSplitText } from "@/lib/utils";
import { useIntl } from "react-intl";
import { Uptime } from "./uptime";

export default function ProvidersCard({ provider }: any) {
  // Safely access stats with defaults
  const activeStats = provider.activeStats || { cpu: 0, memory: 0, gpu: 0, storage: 0 };
  const pendingStats = provider.pendingStats || { cpu: 0, memory: 0, gpu: 0, storage: 0 };
  const availableStats = provider.availableStats || { cpu: 0, memory: 0, gpu: 0, storage: 0 };

  const isOnline = provider.isOnline ?? false;

  const activeCPU = isOnline ? (activeStats.cpu || 0) / 1000 : 0;
  const pendingCPU = isOnline ? (pendingStats.cpu || 0) / 1000 : 0;
  const totalCPU = isOnline
    ? ((availableStats.cpu || 0) +
      (pendingStats.cpu || 0) +
      (activeStats.cpu || 0)) /
    1000
    : 0;

  const gpuModels = (provider.hardwareGpuModels || []).map((gpu: any) =>
    gpu.substring(gpu.lastIndexOf(" ") + 1, gpu.length),
  );

  const _activeMemory = isOnline && (activeStats.memory || pendingStats.memory)
    ? bytesToShrink((activeStats.memory || 0) + (pendingStats.memory || 0))
    : null;
  const _totalMemory = isOnline && (availableStats.memory || pendingStats.memory || activeStats.memory)
    ? bytesToShrink(
      (availableStats.memory || 0) +
      (pendingStats.memory || 0) +
      (activeStats.memory || 0),
    )
    : null;

  const intl = useIntl();
  const name =
    provider?.name?.split(".")?.[provider?.name?.split(".")?.length - 2];

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border   bg-background2 p-4">
      <div className="flex gap-x-[10px]">
        <div className="flex h-12 w-12 items-center justify-center rounded border   bg-background  text-xl font-extrabold uppercase">
          {name?.[0] || provider.owner?.[5] || "?"}
          {name?.[1] || provider.owner?.[6] || ""}
        </div>

        <div>
          <p className="break-words  text-base font-semibold text-foreground">
            {provider.name && provider.name.length > 20 ? (
              <span>{getSplitText(provider.name, 4, 13)}</span>
            ) : (
              <span>{provider.name || provider.owner || "Unknown Provider"}</span>
            )}
          </p>
          <p className="break-words  text-xs text-cardGray">
            {provider.hostUri && provider.hostUri.length > 20 ? (
              <span>{getSplitText(provider.hostUri, 4, 13)}</span>
            ) : (
              <span>{provider.hostUri || provider.owner || ""}</span>
            )}
          </p>
        </div>
      </div>

      <div className=" mt-[10px] border-b   pb-3">
        <p
          className={`inline-flex items-center  rounded-full px-2      py-1 text-xs font-medium  ${provider.isAudited
            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20  dark:bg-green-600/20 dark:text-green-500 "
            : "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-600/20 dark:text-yellow-500"
            }`}
        >
          {provider.isAudited ? "Audited" : "Pending"}
        </p>
      </div>

      {provider.uptime7d !== undefined && (
        <div className="mt-3 flex flex-col items-center justify-between ">
          <div className="flex w-full items-center justify-between">
            <p className="text-xs font-medium">{`Uptime: ${intl.formatNumber(
              provider.uptime7d || 0,
              {
                style: "percent",
                maximumFractionDigits: 0,
              },
            )}`}</p>
            <p className="text-xs font-medium text-foreground">7 D</p>
          </div>

          <div className=" mt-3  w-full">
            <Uptime value={provider.uptime7d || 0} />
          </div>
        </div>
      )}

      <div className="  mt-3  flex flex-col gap-y-[6px]">
        {totalCPU > 0 && (
          <Stats
            componentName="CPU:"
            isOver60Percent={
              totalCPU > 0 && Math.round(((activeCPU + pendingCPU) / totalCPU) * 100) > 60
            }
            value={`${Math.round(activeCPU + pendingCPU)} / ${Math.round(
              totalCPU,
            )}`}
          />
        )}

        {gpuModels.length > 0 && (
          <div className="flex w-full items-center   justify-between rounded-sm border  p-2">
            <p className=" text-xs font-medium">GPU:</p>

            <div className="flex items-center justify-center gap-x-1">
              {gpuModels.slice(0, 1).map((gpu: any, i: any) => (
                <p
                  key={i}
                  className="rounded-full  border   bg-[#F4F4F4] px-2 text-2xs   font-bold  text-cardGray dark:bg-darkGray dark:text-para"
                >
                  {gpu}
                </p>
              ))}

              {gpuModels.length > 2 && (
                <HoverCard>
                  <HoverCardTrigger>
                    <p className="rounded-full  border   bg-[#F4F4F4] px-2 text-xs   font-bold  text-cardGray dark:bg-darkGray dark:text-para">
                      {`+${gpuModels.length - 1}`}
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="flex w-52 flex-wrap gap-x-2 gap-y-2 rounded-lg bg-background2 p-2">
                      {gpuModels.slice(1).map((gpu: any, i: any) => (
                        <p
                          key={i}
                          className="rounded-full  border  bg-[#F4F4F4] px-2   text-xs  font-bold text-cardGray"
                        >
                          {gpu}
                        </p>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
          </div>
        )}

        {_activeMemory && _totalMemory && (
          <Stats
            componentName="Memory:"
            value={`${roundDecimal(
              _activeMemory?.value as number,
              0,
            )} ${_activeMemory?.unit} /  ${roundDecimal(
              _totalMemory?.value as number,
              0,
            )} ${_totalMemory?.unit} `}
            isOver60Percent={
              ((activeStats.memory || 0) + (pendingStats.memory || 0)) /
              ((availableStats.memory || 0) +
                (pendingStats.memory || 0) +
                (activeStats.memory || 0)) >
              0.64
            }
          />
        )}
        {provider.leaseCount !== undefined && (
          <Stats componentName="Active Leases:" value={provider.leaseCount || 0} />
        )}

        {provider.ipRegion && provider.ipCountry && (
          <Stats
            componentName="Region:"
            value={`${provider.ipRegionCode}, ${provider.ipCountryCode}`}
          />
        )}
      </div>

      <div className="mt-auto pt-3">
        <a
          target="_blank"
          href={`https://console.akash.network/providers/${provider.owner}`}
          className="flex cursor-pointer items-center gap-x-2 text-sm font-semibold  text-foreground hover:text-primary"
        >
          View on Akash Console
          <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

function Stats({ componentName, value, isOver60Percent }: any) {
  return (
    <div className="flex w-full items-center   justify-between rounded-sm border border-[#E6E8EB]   p-[9px] text-cardGray">
      <p className="  text-xs   font-medium">{componentName}</p>
      <p
        className={` text-xs font-medium text-foreground ${isOver60Percent ? "text-primary" : ""
          }`}
      >
        {value}
      </p>
    </div>
  );
}

function Initials() {
  return (
    <>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden md:block"
      >
        <rect x="0.5" y="0.5" width="47" height="47" rx="4.5" fill="#FBF8F7" />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="4.5"
          stroke="#D9D9D9"
        />
        <path
          d="M7.72159 32.5V15.0455H10.8835V22.4347H18.9716V15.0455H22.142V32.5H18.9716V25.0852H10.8835V32.5H7.72159ZM27.6784 32.5H24.3034L30.4483 15.0455H34.3517L40.5051 32.5H37.1301L32.4682 18.625H32.3319L27.6784 32.5ZM27.7892 25.6562H36.9938V28.196H27.7892V25.6562Z"
          fill="#11181C"
        />
      </svg>

      <svg
        className="md:hidden"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1.24094"
          y="1.23996"
          width="26.32"
          height="26.32"
          rx="1.58667"
          fill="#FBF8F7"
        />
        <rect
          x="1.24094"
          y="1.23996"
          width="26.32"
          height="26.32"
          rx="1.58667"
          stroke="#D9D9D9"
          strokeWidth="0.56"
        />
        <path
          d="M5.36253 18.8999V9.12536H7.13321V13.2633H11.6625V9.12536H13.438V18.8999H11.6625V14.7476H7.13321V18.8999H5.36253ZM16.5384 18.8999H14.6484L18.0895 9.12536H20.2754L23.7213 18.8999H21.8313L19.2206 11.1299H19.1443L16.5384 18.8999ZM16.6004 15.0674H21.755V16.4897H16.6004V15.0674Z"
          fill="#11181C"
        />
      </svg>
    </>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="6"
      height="9"
      viewBox="0 0 6 9"
      fill="none"
      className="text-foreground"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 8L5 4.5L1 1"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
