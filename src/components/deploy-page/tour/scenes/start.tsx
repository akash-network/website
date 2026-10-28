import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsoleLogo } from "../ConsoleLogo";
import { RegionGlobe } from "../globe";
import { Avatar, OrgSwitcher, type SceneProps } from "../ui";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path
        fill="#4285F4"
        d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-2 3.2-4.8 3.2-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.8 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.1H2.1a11 11 0 0 0 0 9.8L5.8 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1L5.8 10c.9-2.7 3.3-4.6 6.2-4.6Z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/** Console's sign-in page: a dark panel with the region globe, and the form. */
export function SignUpScene(props: SceneProps) {
  return (
    <div className="flex h-full">
      <div className="tc dark relative flex w-1/2 flex-col px-8 py-9 text-tc-fg">
        <div aria-hidden className="absolute inset-0 bg-[#141414]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage: "url('/images/deploy-tour/noise.webp')",
            backgroundSize: "365px 365px",
          }}
        />
        <div className="relative flex items-center justify-between">
          <ConsoleLogo className="h-[26px]" />
          <span className="flex items-center gap-2 text-[11px] text-tc-fg/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            H100 GPUs: Starting at ${props.data.h100From.toFixed(2)}/hr
          </span>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <RegionGlobe size={420} still={props.reduced} />
        </div>
        <div className="relative flex justify-end text-[11.5px] text-tc-fg/55">
          <span className="flex items-center gap-1">
            Need Help? Read the full deployment guide{" "}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      <div className="flex w-1/2 items-center justify-center bg-white text-[#0a0a0a] dark:bg-[#0a0a0a] dark:text-white">
        <div className="w-[300px]">
          <div className="text-center text-[30px] tracking-tight">
            Start deploying
          </div>
          <div className="mt-1.5 text-center text-[12px] text-tc-fg/55">
            $1 credit to deploy your first container. No card required.
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <span className="flex h-9 items-center justify-center gap-2 rounded-md border border-tc-fg/15 text-[12px] font-medium">
              <GoogleIcon /> Continue with Google
            </span>
            <span
              data-tt="oauth-github"
              className="flex h-9 items-center justify-center gap-2 rounded-md border border-tc-fg/15 text-[12px] font-medium"
            >
              <GithubIcon /> Continue with GitHub
            </span>
          </div>
          <div className="my-4 flex items-center gap-3 text-[10px] text-tc-fg/40">
            <span className="h-px flex-1 bg-tc-fg/10" />
            OR
            <span className="h-px flex-1 bg-tc-fg/10" />
          </div>
          <div className="text-[11px] font-medium">Email</div>
          <div className="mt-1.5 flex h-9 items-center rounded-md border border-tc-fg/15 px-3 text-[12px] text-tc-fg/40">
            you@company.com
          </div>
          <span className="mt-3 flex h-9 w-full items-center justify-center rounded-md bg-tc-primary text-[12px] font-medium text-tc-primary-fg">
            Continue with email
          </span>
          <div className="mt-4 text-center text-[10px] leading-relaxed text-tc-fg/55">
            We&apos;ll email you a 6 digit code. No password to remember.
            <br />
            By continuing, you agree to our <u>Terms</u> and{" "}
            <u>Privacy Policy</u>.
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  {
    id: "card-hello",
    tag: "Next.js",
    title: "Hello world",
    body: "Spin up a modern Next.js app running in a Docker container in seconds.",
    price: "~$0.25/mo",
    spec: "0.5 vCPU · 512MiB RAM · 512MiB",
    cta: "Deploy now",
    image: "/images/deploy-tour/hello-world.webp",
  },
  {
    id: "card-agent",
    tag: "Agent Zero",
    title: "Space Agent",
    body: "An open-source AI agent that runs in the browser layer and can reshape its own workspace on the fly.",
    price: "~$3.41/mo",
    spec: "4 vCPU · 8GiB RAM · 50GiB",
    cta: "Deploy now",
    image: "/images/deploy-tour/space-agent.webp",
  },
  {
    id: "card-llm",
    tag: "Llama 3.1 8B",
    title: "LLM Chatbot",
    body: "Your own private AI chat. Secure, persistent, and fully under your control.",
    price: "~$1.50/hr",
    spec: "12 vCPU · 1 GPU · 32GiB RAM · 160GiB",
    cta: "Add credits to unlock",
    image: "/images/deploy-tour/llm-chatbot.webp",
  },
];

/** Console's first-run screen with its three starter templates. */
export function OnboardingScene(_props: SceneProps) {
  return (
    <div className="flex h-full flex-col bg-tc-bg">
      <div className="flex h-14 shrink-0 items-center border-b border-tc-fg/10 px-6">
        <ConsoleLogo className="h-[17px] text-tc-fg" />
        <div className="ml-auto flex items-center gap-2.5">
          <OrgSwitcher org="Personal" />
          <Avatar />
        </div>
      </div>
      <div className="mx-auto w-[920px] pt-7">
        <div className="text-[28px] font-bold tracking-tight">
          Let&apos;s deploy your first app
        </div>
        <div className="mt-2 max-w-[720px] text-[13px] leading-relaxed text-tc-fg/60">
          We&apos;ve provided you with{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            $1 in free trial credits
          </span>
          . This covers a couple of smaller deployments so you can see how easy
          it is. Pick a template to get a live URL in about 30 seconds.
        </div>
        <div className="mt-6 grid grid-cols-3 gap-5">
          {TEMPLATES.map((t, i) => (
            <div
              key={t.id}
              data-tt={t.id}
              className="tour-rise relative"
              style={{ animationDelay: `${100 + i * 110}ms` }}
            >
              {i === 0 && (
                <span className="absolute left-3 top-2.5 z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  Recommended for new users
                </span>
              )}
              <img
                src={t.image}
                alt=""
                className="h-[132px] w-full rounded-t-xl object-cover"
              />
              <div className="rounded-b-xl border border-t-0 border-tc-fg/10 bg-tc-card p-4">
                <span className="rounded-md border border-tc-fg/15 px-1.5 py-0.5 text-[10px] text-tc-fg/70">
                  {t.tag}
                </span>
                <div className="mt-3 text-[20px] font-semibold tracking-tight">
                  {t.title}
                </div>
                <div className="mt-1.5 line-clamp-2 h-[36px] text-[12px] leading-[18px] text-tc-fg/60">
                  {t.body}
                </div>
                <div className="mt-3 font-jetBrainsMono text-[10.5px] text-tc-fg/55">
                  <span className="font-semibold text-tc-fg">{t.price}</span> ·{" "}
                  {t.spec}
                </div>
                <span
                  data-tt={i === 0 ? "card-hello-cta" : undefined}
                  className={cn(
                    "mt-3 flex h-9 items-center justify-center gap-1.5 rounded-md text-[12.5px] font-medium",
                    i === 0
                      ? "bg-tc-primary text-tc-primary-fg"
                      : "border border-tc-fg/15",
                  )}
                >
                  {t.cta}
                  {i === 2 ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center rounded-xl border border-tc-fg/10 bg-tc-card px-4 py-3">
          <div className="text-[13px] font-semibold">
            Already have a Docker Image?
          </div>
          <div className="ml-2 text-[11px] text-tc-fg/55">
            Recommended for experienced developers who want to get started right
            away.
          </div>
          <span className="ml-auto flex h-9 items-center gap-1.5 rounded-md border border-tc-fg/15 px-4 text-[12.5px] font-medium">
            Deploy image <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-5 text-center text-[12px] font-medium text-tc-fg/60">
          Skip onboarding
        </div>
      </div>
    </div>
  );
}
