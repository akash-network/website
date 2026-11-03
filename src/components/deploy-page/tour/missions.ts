// Missions of the Akash Console tour on /deploy.
//
// The visitor picks a mission and performs each step themselves in a mock of
// Console. A step can first play a short intro (typing, bids arriving), then
// waits for its action: a click on the element tagged `data-tt="<target>"`
// (a trailing `*` matches a prefix, for choices). Steps without an action
// continue on their own. Scenes derive what they show from the current step
// and its `stage`, so any step can be opened directly.
//
// Screens follow Console as of October 2026 (github.com/akash-network/console).
// GPU availability and price ranges are live; providers and bids are simulated.

export type TourAction = {
  /** Pause before the action, in ms. */
  wait?: number;
  /** Watch mode only: move the cursor to this element (and click it). */
  to?: string;
  click?: boolean;
};

export type Screen =
  | "signup"
  | "onboarding"
  | "autodeploy"
  | "deployments"
  | "deployment"
  | "app"
  | "configure"
  | "team"
  | "projects";

export type StepAction = {
  target: string;
  label: string;
  /** Element outlined as the hint; defaults to the target. */
  ring?: string;
  /** The click picks an option, read from the target's `data-choice`. */
  choice?: "gpu" | "bid";
};

export type Step = {
  id: string;
  chapter: string;
  title: string;
  body: string;
  screen: Screen;
  /** Address bar path, or one per stage (the last one sticks). */
  path: string | string[];
  intro?: TourAction[];
  action?: StepAction;
  /** Simulated deployment clock, in seconds, per stage (the last one sticks). */
  clock?: number[];
};

export type MissionId = "web" | "gpu" | "team";

export type Mission = {
  id: MissionId;
  title: string;
  short: string;
  image: string;
  chapters: string[];
  /** How much faster than real time the deployment clock runs. */
  speed?: number;
  steps: Step[];
};

export const HOST = "r9k2mq4lv0c1p7e3.ingress.northwind.example";

export const MISSIONS: Mission[] = [
  {
    id: "web",
    title: "Ship a web app",
    short: "Web app",
    image: "/images/deploy-tour/hello-world.webp",
    chapters: ["Start", "Deploy", "Live"],
    speed: 5,
    steps: [
      {
        id: "web-sign-in",
        chapter: "Start",
        title: "Sign in to Console",
        body: "Use Google, GitHub or a one-time email code. There's no password to remember.",
        screen: "signup",
        path: "/login",
        action: { target: "oauth-github", label: "Continue with GitHub" },
      },
      {
        id: "web-template",
        chapter: "Start",
        title: "Pick the Hello world template",
        body: "Starter templates are one click away. Hello world is a Next.js app in a Docker container.",
        screen: "onboarding",
        path: "/onboarding",
        intro: [{ wait: 500 }],
        action: {
          target: "card-hello-cta",
          ring: "card-hello",
          label: "Deploy Hello world",
        },
      },
      {
        id: "web-deploying",
        chapter: "Deploy",
        title: "Console picks a provider for you",
        body: "A one-click deploy creates the deployment, collects bids from providers and accepts one for you.",
        screen: "autodeploy",
        path: "/new-deployment/configure?templateId=hello-world",
        intro: [{ wait: 900 }, { wait: 1300 }, { wait: 1300 }, { wait: 700 }],
        clock: [0, 3, 13, 22, 22],
      },
      {
        id: "web-ready",
        chapter: "Live",
        title: "Your app is up",
        body: "Console takes you to your deployments and tells you the moment every service is running.",
        screen: "deployments",
        path: "/deployments",
        intro: [{ wait: 1000 }],
        clock: [22, 27],
        action: { target: "toast-view", label: "View deployment" },
      },
      {
        id: "web-visit",
        chapter: "Live",
        title: "Open your live URL",
        body: "Each exposed port gets a public URL from the provider. Open it straight from the deployment.",
        screen: "deployment",
        path: "/deployments/24318907",
        action: { target: "visit", label: "Visit" },
      },
      {
        id: "web-app",
        chapter: "Live",
        title: "It's live",
        body: "Your container, served by an independent provider on the Akash network.",
        screen: "app",
        path: HOST,
        intro: [{ wait: 1800 }],
      },
    ],
  },
  {
    id: "gpu",
    title: "Serve an LLM on a GPU",
    short: "GPU LLM",
    image: "/images/deploy-tour/llm-chatbot.webp",
    chapters: ["Describe", "Auction", "Launch", "Use"],
    speed: 20,
    steps: [
      {
        id: "gpu-image",
        chapter: "Describe",
        title: "Bring any container image",
        body: "Paste an image from any registry. This one is vLLM, ready to serve Llama 3.1 8B over an OpenAI-compatible API.",
        screen: "configure",
        path: "/new-deployment/configure",
        action: { target: "image", label: "Add the image" },
      },
      {
        id: "gpu-model",
        chapter: "Describe",
        title: "Pick a GPU",
        body: "Console shows how many providers and GPUs are free for each model, so you know before you ask for a single quote.",
        screen: "configure",
        path: "/new-deployment/configure",
        intro: [{ wait: 150, to: "image" }, { wait: 1300 }],
        action: {
          target: "gpu-row-*",
          ring: "gpu-table",
          choice: "gpu",
          label: "Pick a GPU",
        },
      },
      {
        id: "gpu-choose",
        chapter: "Auction",
        title: "Ask the market",
        body: "Choosing a provider sends your exact spec to every provider that can run it. They reply with bids.",
        screen: "configure",
        path: "/new-deployment/configure",
        intro: [{ wait: 500 }],
        action: { target: "choose-provider", label: "Choose a provider" },
      },
      {
        id: "gpu-auction",
        chapter: "Auction",
        title: "Pick your provider",
        body: "Independent providers bid on your deployment. Compare price, region and uptime, then accept the bid you want.",
        screen: "configure",
        path: [
          "/new-deployment/configure",
          "/new-deployment/configure/24318907",
        ],
        intro: [
          { wait: 400 },
          { wait: 1300 },
          { wait: 1300 },
          { wait: 1300 },
          { wait: 1500 },
        ],
        clock: [0, 1, 2, 3, 4, 5],
        action: {
          target: "bid-row-*",
          ring: "bid-table",
          choice: "bid",
          label: "Accept a bid",
        },
      },
      {
        id: "gpu-review",
        chapter: "Launch",
        title: "Review and deploy",
        body: "See the total before you commit. Escrow is held, not charged: you pay for the time your deployment runs.",
        screen: "configure",
        path: "/new-deployment/configure/24318907",
        intro: [{ wait: 500 }, { wait: 800, to: "funding", click: true }],
        clock: [6, 7, 9],
        action: { target: "confirm-deploy", label: "Confirm and deploy" },
      },
      {
        id: "gpu-live",
        chapter: "Launch",
        title: "Watch it come up",
        body: "The provider pulls your image and starts the container. Large models take a little longer while the weights load.",
        screen: "deployment",
        path: "/deployments/24318907?tab=EVENTS",
        intro: [
          { wait: 700 },
          { wait: 1000 },
          { wait: 900 },
          { wait: 1000 },
          { wait: 900 },
        ],
        clock: [12, 18, 59, 62, 104, 131],
        action: { target: "copy-endpoint", label: "Copy the endpoint" },
      },
      {
        id: "gpu-call",
        chapter: "Use",
        title: "Call your endpoint",
        body: "It's your own OpenAI-compatible API, on the GPU you picked, at the price you accepted.",
        screen: "deployment",
        path: "/deployments/24318907?tab=EVENTS",
        intro: [{ wait: 400 }, { wait: 1600 }],
        action: { target: "run-curl", label: "Run it" },
      },
      {
        id: "gpu-answer",
        chapter: "Use",
        title: "Look inside the container",
        body: "Need to debug? Open a shell in any service straight from the browser, with no SSH keys to manage.",
        screen: "deployment",
        path: "/deployments/24318907?tab=EVENTS",
        intro: [{ wait: 400 }, { wait: 2200 }],
        action: { target: "tab-shell", label: "Open a shell" },
      },
      {
        id: "gpu-shell",
        chapter: "Use",
        title: "Your GPU, your container",
        body: "The GPU you picked, running your model.",
        screen: "deployment",
        path: "/deployments/24318907?tab=SHELL",
        intro: [{ wait: 500 }, { wait: 900 }, { wait: 1800 }],
      },
    ],
  },
  {
    id: "team",
    title: "Run a team",
    short: "Team",
    image: "/images/deploy-tour/space-agent.webp",
    chapters: ["Billing", "Team", "Budgets"],
    steps: [
      {
        id: "team-billing",
        chapter: "Billing",
        title: "Pay as you go, by card",
        body: "Your balance splits into escrow held for running deployments and credit that's free to spend. Auto recharge charges your card before it runs low.",
        screen: "team",
        path: "/billing",
        action: { target: "auto-recharge", label: "Turn on auto recharge" },
      },
      {
        id: "team-switch",
        chapter: "Team",
        title: "Switch to your organization",
        body: "An organization has its own balance, cards and deployments, separate from your personal account.",
        screen: "team",
        path: "/billing",
        intro: [{ wait: 700 }],
        action: { target: "org-switcher", label: "Open the switcher" },
      },
      {
        id: "team-invite",
        chapter: "Team",
        title: "Invite a teammate",
        body: "Invite people as Admin, Member, Billing or Viewer, and choose which projects they can open.",
        screen: "team",
        path: ["/billing", "/billing", "/members"],
        intro: [{ wait: 300 }, { wait: 900, to: "org-acme", click: true }],
        action: { target: "invite-open", label: "Invite members" },
      },
      {
        id: "team-send",
        chapter: "Team",
        title: "Send the invite",
        body: "They get an email with a link to join. Invitations stay valid for 7 days.",
        screen: "team",
        path: "/members",
        intro: [
          { wait: 400 },
          { wait: 300, to: "invite-email", click: true },
          { wait: 1000 },
        ],
        action: { target: "invite-send", label: "Send invite" },
      },
      {
        id: "team-projects",
        chapter: "Budgets",
        title: "Open your projects",
        body: "Projects group the deployments behind one app, together with who can open them.",
        screen: "team",
        path: "/members",
        intro: [{ wait: 600 }],
        action: { target: "nav-projects", label: "Open Projects" },
      },
      {
        id: "team-budget",
        chapter: "Budgets",
        title: "Give it a monthly budget",
        body: "Owners and admins get an email when a project's deposits reach the alert threshold. A new deployment that would go past the budget is refused.",
        screen: "projects",
        path: "/projects",
        intro: [
          { wait: 500 },
          { wait: 500, to: "set-budget", click: true },
          { wait: 1200 },
        ],
        action: { target: "save-budget", label: "Save budget" },
      },
      {
        id: "team-done",
        chapter: "Budgets",
        title: "Your team is set up",
        body: "One balance, clear roles and a budget per project.",
        screen: "projects",
        path: "/projects",
        intro: [{ wait: 1600 }],
      },
    ],
  },
];

export const missionById = (id: MissionId) =>
  MISSIONS.find((m) => m.id === id)!;

export const pathAt = (step: Step, stage: number) =>
  typeof step.path === "string"
    ? step.path
    : step.path[Math.min(stage, step.path.length - 1)];

export const clockAt = (step: Step, stage: number) =>
  step.clock ? step.clock[Math.min(stage, step.clock.length - 1)] : null;
