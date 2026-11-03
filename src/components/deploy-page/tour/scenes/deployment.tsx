import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Globe,
  MapPin,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  hourly,
  monthly,
  simulateBids,
  type Bid,
  type GpuOption,
} from "../data";
import { HOST } from "../missions";
import {
  ConsoleNav,
  Overline,
  Spinner,
  StatusBadge,
  Typed,
  typeState,
  type SceneProps,
} from "../ui";
import { IMAGE } from "./configure";

const POD = "llama-chat-6d9c8b7f5-x2q4n";
const PROMPT = "What is Akash, in one sentence?";
const ANSWER =
  "Akash is a decentralized cloud marketplace where independent providers compete to run your containers, GPUs included.";

const LOG_LINES = [
  "INFO api_server.py:712] vLLM API server version 0.9.2",
  "INFO api_server.py:713] args: model='meta-llama/Llama-3.1-8B-Instruct', max_model_len=32768",
  "INFO cuda.py:240] Using Flash Attention backend.",
  "INFO model_runner.py:1072] Loading model weights took 14.99 GB",
  "INFO gpu_executor.py:122] # GPU blocks: 27450, # CPU blocks: 2048",
  "INFO launcher.py:19] Available routes are: /v1/models, /v1/chat/completions, /health",
  "INFO:     Started server process [1]",
  "INFO:     Application startup complete.",
  "INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)",
];

/** The ingress host a provider hands out, e.g. provider.fjell.example → <id>.ingress.fjell.example. */
export const ingressHost = (bid: Bid | null) =>
  bid
    ? `${HOST.split(".")[0]}.ingress.${bid.host.split(".").slice(1).join(".")}`
    : HOST;

export function deploymentFacts(props: SceneProps) {
  const gpu = props.mission === "gpu";
  const option: GpuOption = props.ctx.gpu ?? props.data.gpus[0];
  const bid = props.ctx.bid ?? (gpu ? simulateBids(option)[0] : null);
  return {
    gpu,
    option,
    bid,
    name: gpu ? "llama-chat" : "Hello world",
    provider: bid?.name ?? "Northwind Compute",
    region: bid?.region ?? "us-west",
    host: ingressHost(bid),
  };
}

function nvidiaSmi(option: GpuOption) {
  const name = `NVIDIA ${option.name}`.slice(0, 26).padEnd(26);
  const total = parseInt(option.ram, 10) * 1024 - 360;
  const used = Math.round(total * 0.87);
  const mem = `${used}MiB / ${total}MiB`.padStart(22);
  return [
    "+-----------------------------------------------------------------------------------------+",
    "| NVIDIA-SMI 570.86.15              Driver Version: 570.86.15      CUDA Version: 12.8     |",
    "|-----------------------------------------+------------------------+----------------------+",
    "| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |",
    "| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |",
    "|=========================================+========================+======================|",
    `|   0  ${name}         On |   00000000:1B:00.0 Off |                    0 |`,
    `| N/A   34C    P0            118W /  700W | ${mem} |     12%      Default |`,
    "+-----------------------------------------+------------------------+----------------------+",
  ].join("\n");
}

function Prompt() {
  return (
    <>
      <span className="text-emerald-400">root@{POD}</span>:
      <span className="text-blue-400">/vllm-workspace</span>#{" "}
    </>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="relative flex h-9 w-[160px] items-center rounded-md border border-tc-fg/15 bg-tc-bg px-3 text-[12px]">
        <span className="absolute -top-2 left-2 bg-tc-bg px-1 text-[10px] text-tc-fg/60">
          Services
        </span>
        llama-chat <ChevronDown className="ml-auto h-3.5 w-3.5" />
      </span>
      {children}
    </div>
  );
}

export function DeploymentScene(props: SceneProps) {
  const { at, mission } = props;
  const f = deploymentFacts(props);

  const shell = at("gpu-shell");
  const showLogs = f.gpu && at("gpu-live", 4) && !shell;
  const tab = f.gpu
    ? shell
      ? "Shell"
      : showLogs
        ? "Logs"
        : "Events"
    : "Details";
  const running = f.gpu ? at("gpu-live", 3) : true;
  const status = running
    ? "Running"
    : at("gpu-live", 2)
      ? "Starting"
      : "Spinning up";
  const events = [
    `Scheduled: Successfully assigned 8kq2…/${POD} to gpu-node-04`,
    `Pulling: Pulling image "${IMAGE}"`,
    `Pulled: Successfully pulled image "${IMAGE}" in 41.3s`,
    "Created: Created container llama-chat",
    "Started: Started container llama-chat",
  ].slice(0, at("gpu-live", 3) ? 5 : at("gpu-live", 2) ? 3 : 2);
  const logCount = at("gpu-live", 5) ? LOG_LINES.length : 4;
  const tabs =
    mission === "web"
      ? ["Details", "Template", "Update", "Logs", "Events", "Shell", "Settings"]
      : ["Details", "Update", "Logs", "Events", "Shell", "Settings"];

  return (
    <div className="relative flex h-full flex-col bg-tc-bg">
      <ConsoleNav active="Deployments" />

      <div className="flex shrink-0 gap-8 px-10 py-5">
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] text-tc-fg/50">Projects / default</div>
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
          <div className="mt-1.5 text-[28px] font-bold tracking-tight">
            {f.name}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="flex h-8 min-w-0 max-w-[320px] items-center gap-1.5 rounded-full border border-tc-fg/15 px-3 text-[11.5px]">
              <Globe className="h-3.5 w-3.5 shrink-0 text-tc-fg/50" />
              {running ? (
                <span className="truncate font-jetBrainsMono">{f.host}:80</span>
              ) : (
                <span className="text-tc-fg/50">
                  no endpoint yet · spinning up
                </span>
              )}
            </span>
            <span
              data-tt="copy-endpoint"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-tc-fg/15"
            >
              {at("gpu-call") ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-tc-fg/60" />
              )}
            </span>
            <span
              data-tt="visit"
              className={cn(
                "flex h-8 items-center rounded-md px-4 text-[12px] font-medium transition-colors",
                running
                  ? "bg-tc-primary text-tc-primary-fg"
                  : "bg-tc-fg/10 text-tc-fg/40",
              )}
            >
              Visit
            </span>
          </div>
        </div>
        <div className="grid w-[460px] shrink-0 grid-cols-4 gap-y-3 self-start rounded-[14px] border border-tc-fg/10 bg-tc-card p-4 shadow-sm">
          {[
            ["Total services", "1"],
            f.gpu && f.bid
              ? ["Cost", hourly(f.bid.hr), monthly(f.bid.hr)]
              : ["Cost", "$0.25/month"],
            ["Runtime limit", "None"],
            ["Placement", "dcloud"],
            ["GPU", f.gpu ? `1× ${f.option.name}` : "—"],
            ["vCPU", f.gpu ? "8" : "0.5"],
            ["Memory", f.gpu ? "32 GiB" : "512 MiB"],
            ["Storage", f.gpu ? "100 GiB" : "512 MiB"],
          ].map(([label, value, sub]) => (
            <div key={label}>
              <div className="text-[10px] font-medium uppercase tracking-wide text-tc-fg/50">
                {label}
              </div>
              <div className="mt-0.5 text-[12.5px] font-medium tabular-nums">
                {value}
              </div>
              {sub && (
                <div className="text-[10px] tabular-nums text-tc-fg/45">
                  {sub}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-7 border-y border-tc-fg/10 px-10 text-[13px] font-medium">
        {tabs.map((t) => (
          <span
            key={t}
            data-tt={`tab-${t.toLowerCase()}`}
            className={cn(
              "-mb-px border-b-2 py-2.5 transition-colors duration-300",
              t === tab
                ? "border-tc-fg text-tc-fg"
                : "border-transparent text-tc-fg/50",
            )}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col bg-tc-fg/[0.03] px-10 py-5">
        {tab === "Details" && (
          <div className="flex flex-col gap-2 motion-safe:animate-in motion-safe:fade-in-0">
            <div className="flex items-center">
              <Overline>Placements</Overline>
              <span className="ml-auto text-[11px] text-tc-fg/50">
                1 placement · 1 service
              </span>
            </div>
            <div className="rounded-xl border border-tc-fg/10 bg-tc-card shadow-sm">
              <div className="flex items-center gap-3 border-b border-tc-fg/10 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tc-fg/[0.07] text-[12px] font-semibold">
                  1
                </span>
                <div>
                  <div className="text-[20px] font-semibold leading-none">
                    dcloud
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-tc-fg/55">
                    <MapPin className="h-3 w-3" /> {f.region}{" "}
                    <ChevronRight className="h-3 w-3" />{" "}
                    <Server className="h-3 w-3" /> {f.provider}
                  </div>
                </div>
                <div className="ml-auto grid grid-cols-4 gap-6 text-right text-[11px]">
                  {[
                    ["vCPU", "0.5"],
                    ["Memory", "512 MiB"],
                    ["Storage", "512 MiB"],
                    ["Services", "1"],
                  ].map(([l, v]) => (
                    <span key={l}>
                      <span className="block uppercase text-tc-fg/50">{l}</span>
                      <b className="text-[13px] font-semibold">{v}</b>
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-[11px]">
                  <Overline>Services in this placement</Overline>
                  <span className="ml-1.5 rounded bg-tc-fg/10 px-1 text-[10px]">
                    1
                  </span>
                  <span className="ml-auto text-tc-fg/55">Expand all</span>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-tc-fg/10 px-3 py-2.5 text-[12.5px]">
                  <ChevronRight className="h-4 w-4 text-tc-fg/50" />
                  <b className="font-semibold">web</b>
                  <StatusBadge status="Running" />
                  <span className="ml-auto text-[11.5px] text-tc-fg/55">
                    1/1 replicas
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(tab === "Events" || tab === "Logs") && (
          <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-in motion-safe:fade-in-0">
            <Toolbar>
              <span className="flex items-center gap-2 text-[12px]">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-tc-primary text-tc-primary-fg">
                  <Check className="h-2.5 w-2.5" />
                </span>
                Stick to bottom
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-tc-fg/15 bg-tc-bg px-3 py-1.5 text-[12px] font-medium">
                <Download className="h-3.5 w-3.5" />{" "}
                {tab === "Logs" ? "Download logs" : "Download events"}
              </span>
            </Toolbar>
            <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-md border border-tc-fg/10 bg-tc-code py-2 font-jetBrainsMono text-[11px] leading-[19px]">
              {tab === "Events"
                ? events.map((e, i) => {
                    const [reason, ...rest] = e.split(": ");
                    return (
                      <div key={i} className="tour-rise flex whitespace-nowrap">
                        <span className="w-10 shrink-0 pr-3 text-right text-tc-fg/30">
                          {i + 1}
                        </span>
                        <span className="text-tc-fg/45">[llama-chat]</span>
                        &nbsp;
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {reason}
                        </span>
                        <span className="text-tc-fg/80">
                          : {rest.join(": ")}
                        </span>
                      </div>
                    );
                  })
                : LOG_LINES.slice(0, logCount).map((line, i) => (
                    <div
                      key={i}
                      className="tour-rise flex whitespace-nowrap"
                      style={{ animationDelay: `${(i % 5) * 120}ms` }}
                    >
                      <span className="w-10 shrink-0 pr-3 text-right text-tc-fg/30">
                        {i + 1}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        [llama-chat]:
                      </span>
                      &nbsp;
                      <span className="text-tc-fg/85">{line}</span>
                    </div>
                  ))}
              {tab === "Events" && !running && (
                <div className="flex items-center gap-2 pl-10 pt-1 text-tc-fg/45">
                  <Spinner className="h-3 w-3" /> Waiting for events…
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Shell" && (
          <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-in motion-safe:fade-in-0">
            <Toolbar>
              <span className="flex items-center gap-1.5 rounded-md border border-tc-fg/15 bg-tc-bg px-3 py-1.5 text-[12px] font-medium">
                <Download className="h-3.5 w-3.5" /> Download file
              </span>
            </Toolbar>
            <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-md bg-[#0a0a0a] p-3 font-jetBrainsMono text-[10.5px] leading-[16px] text-white/85">
              <div className="text-white/60">
                Welcome to Akash Console Shell! ☁️
              </div>
              <div className="mt-1">
                <Prompt />
                <Typed
                  text="nvidia-smi"
                  state={typeState(props, "gpu-shell", 1, 2)}
                  speed={70}
                />
              </div>
              {at("gpu-shell", 2) && (
                <>
                  <pre className="tour-rise mt-1 whitespace-pre">
                    {nvidiaSmi(f.option)}
                  </pre>
                  <div className="mt-1">
                    <Prompt />
                    <span className="inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-white/80" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** A local terminal window that floats over the browser while the visitor
 * calls their new endpoint. Rendered by the tour outside the browser frame. */
export function TerminalOverlay(props: SceneProps) {
  const { at } = props;
  const show = props.mission === "gpu" && at("gpu-call") && !at("gpu-shell");
  const f = deploymentFacts(props);
  const command = `curl http://${f.host}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "meta-llama/Llama-3.1-8B-Instruct",
       "messages": [{"role": "user", "content": "${PROMPT}"}]}'`;
  const ran = at("gpu-answer");

  return (
    <div
      className={cn(
        "absolute bottom-6 right-6 z-40 w-[600px] overflow-hidden rounded-xl bg-[#0b0b0b] text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-all duration-500",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <div className="flex h-8 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto font-jetBrainsMono text-[10.5px] text-white/45">
          ~ — zsh — your laptop
        </span>
      </div>
      <div className="min-h-[300px] p-4 font-jetBrainsMono text-[11px] leading-[17px]">
        <div className="whitespace-pre-wrap break-all">
          <span className="text-emerald-400">~</span> ${" "}
          <Typed
            text={command}
            state={typeState(props, "gpu-call", 1, 2)}
            speed={9}
          />
        </div>
        {!ran && at("gpu-call", 2) && (
          <span
            data-tt="run-curl"
            className="mt-3 inline-flex items-center gap-1.5 rounded border border-white/20 px-2 py-0.5 text-[10.5px] text-white/70"
          >
            ⏎ Press Enter to run
          </span>
        )}
        {ran && (
          <pre className="mt-2 whitespace-pre-wrap text-white/80">
            {`{
  "object": "chat.completion",
  "model": "meta-llama/Llama-3.1-8B-Instruct",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "`}
            <span className="text-amber-200">
              <Typed
                text={ANSWER}
                state={typeState(props, "gpu-answer", 1, 2)}
                speed={22}
              />
            </span>
            {at("gpu-answer", 2)
              ? `"
    }
  }]
}`
              : ""}
          </pre>
        )}
      </div>
    </div>
  );
}
