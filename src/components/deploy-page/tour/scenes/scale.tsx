import {
  Check,
  ChevronDown,
  CreditCard,
  FolderKanban,
  Info,
  Plus,
  UserPlus,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  ConsoleNav,
  Overline,
  Toast,
  Toggle,
  Typed,
  typeState,
  type SceneProps,
} from "../ui";

function SettingsLayout({
  items,
  active,
  title,
  description,
  action,
  children,
}: {
  items: string[];
  active: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="w-[216px] shrink-0 border-r border-tc-fg/10 px-3 py-5">
        <Overline className="px-3">Settings</Overline>
        <div className="mt-2 flex flex-col gap-0.5 text-[13px]">
          {items.map((item) => (
            <span
              key={item}
              className={cn(
                "rounded-md px-3 py-1.5",
                item === active
                  ? "bg-tc-fg/[0.07] font-medium"
                  : "text-tc-fg/60",
              )}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 bg-[radial-gradient(circle,rgb(var(--tc-fg)/0.035)_2px,transparent_2px)] [background-size:26px_26px]">
        <div className="flex items-center border-b border-tc-fg/10 bg-tc-bg px-8 py-3.5">
          <div>
            <div className="text-[20px] font-bold tracking-tight">{title}</div>
            <div className="text-[12px] text-tc-fg/55">{description}</div>
          </div>
          <div className="ml-auto">{action}</div>
        </div>
        <div className="px-8 py-5">{children}</div>
      </div>
    </div>
  );
}

function BillingBody({ autoRecharge }: { autoRecharge: boolean }) {
  return (
    <SettingsLayout
      items={["Billing", "API Keys", "Usage", "Alerts"]}
      active="Billing"
      title="Billing"
      description="Manage your balance, payment methods, and payment history."
      action={
        <span className="flex h-8 items-center gap-1.5 rounded-md bg-tc-primary px-3.5 text-[12px] font-medium text-tc-primary-fg">
          <Plus className="h-3.5 w-3.5" /> Add to balance
        </span>
      }
    >
      <Overline>Account</Overline>
      <Card className="mt-2 p-5">
        <div className="flex items-start">
          <div>
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-tc-fg/70">
              <Wallet className="h-4 w-4" /> Account Balance
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="text-[30px] font-bold tabular-nums tracking-tight">
                $500.00
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                10 days of runway
              </span>
            </div>
          </div>
          <div className="ml-auto pt-1 text-right text-[11.5px] text-tc-fg/55">
            Spending $2.04/hr · lasts{" "}
            <b className="font-medium text-tc-fg">about 10 days</b>
          </div>
        </div>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
          <span className="w-[19.6%] bg-tc-fg/30" />
          <span className="flex-1 bg-emerald-500" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-6">
          <div>
            <Overline className="flex items-center gap-1">
              Escrow <Info className="h-3 w-3" />
            </Overline>
            <div className="mt-0.5 text-[18px] font-semibold tabular-nums">
              $97.92
            </div>
            <div className="text-[11px] text-tc-fg/50">
              Held to keep your 1 deployment running
            </div>
          </div>
          <div>
            <Overline className="text-emerald-600 dark:text-emerald-400">
              Available
            </Overline>
            <div className="mt-0.5 text-[18px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              $402.08
            </div>
            <div className="text-[11px] text-tc-fg/50">
              Free to spend on something new
            </div>
          </div>
        </div>
        <div className="-mx-5 mt-4 border-t border-tc-fg/10 px-5 pt-3.5">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[12.5px] font-medium">Auto recharge</div>
              <div className="text-[11px] text-tc-fg/55">
                Automatically charges your default card to keep your deployments
                funded as escrow is spent.
              </div>
            </div>
            <span data-tt="auto-recharge" className="ml-auto">
              <Toggle on={autoRecharge} />
            </span>
          </div>
          <div
            className="grid transition-[grid-template-rows] duration-500 ease-out"
            style={{ gridTemplateRows: autoRecharge ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-tc-fg/70">
                <span className="rounded-full border border-tc-fg/15 px-2 py-0.5 text-[10.5px]">
                  Fixed threshold
                </span>
                When credit balance drops to{" "}
                <b className="text-tc-fg">$100.00</b>, purchase{" "}
                <b className="text-tc-fg">$250.00</b>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Overline className="mt-5">Payment methods</Overline>
      <Card className="mt-2 flex items-center gap-3 px-5 py-3.5 text-[12.5px]">
        <CreditCard className="h-4 w-4 text-tc-fg/60" />
        Visa •••• 4242
        <span className="text-tc-fg/50">Expires 08/29</span>
        <span className="ml-auto rounded-full bg-tc-fg/[0.07] px-2 py-0.5 text-[10.5px]">
          Default
        </span>
      </Card>
    </SettingsLayout>
  );
}

// Invented people on a reserved example domain.
const MEMBERS = [
  {
    name: "Sam Rivera",
    email: "sam@acme.example",
    role: "Owner",
    access: "All projects",
  },
  {
    name: "Priya Nair",
    email: "priya@acme.example",
    role: "Admin",
    access: "All projects",
  },
  {
    name: "Jordan Lee",
    email: "jordan@acme.example",
    role: "Member",
    access: "inference, agents",
  },
  {
    name: "Chris Okafor",
    email: "chris@acme.example",
    role: "Billing",
    access: "—",
  },
];

/** Billing, the organization switcher and Members, in one continuous screen. */
export function TeamScene(props: SceneProps) {
  const { at } = props;
  const orgOpen = at("team-invite") && !at("team-invite", 2);
  const switched = at("team-invite", 2);
  const dialog = at("team-send", 1) && !at("team-projects");
  const invited = at("team-projects");

  return (
    <div className="relative flex h-full flex-col bg-tc-bg">
      <ConsoleNav
        active="Settings"
        org={switched ? "Acme AI" : "Personal"}
        orgOpen={orgOpen}
      />

      {/* Organization switcher */}
      <div
        className={cn(
          "absolute right-14 top-12 z-40 w-[292px] rounded-xl border border-tc-fg/10 bg-tc-card p-1.5 text-[12.5px] shadow-[0_16px_38px_-12px_rgba(0,0,0,0.28)] transition-all duration-150",
          orgOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <Overline className="px-2.5 pb-1 pt-1.5">Personal account</Overline>
        <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-tc-fg/10 text-[10px] font-bold">
            S
          </span>
          sam
          <Check className="ml-auto h-3.5 w-3.5" />
        </div>
        <Overline className="px-2.5 pb-1 pt-2.5">Organizations</Overline>
        <div
          data-tt="org-acme"
          className="flex items-center gap-2 rounded-md bg-tc-fg/[0.06] px-2.5 py-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FF414C] text-[10px] font-bold text-white">
            A
          </span>
          Acme AI
          <span className="ml-auto text-[11px] text-tc-fg/50">Owner</span>
        </div>
        <div className="my-1 h-px bg-tc-fg/10" />
        <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-tc-fg/70">
          <Plus className="h-3.5 w-3.5" /> Create organization
        </div>
      </div>

      {!switched ? (
        <BillingBody autoRecharge={at("team-switch", 1)} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-in motion-safe:fade-in-0">
          <SettingsLayout
            items={[
              "General",
              "Members",
              "Billing",
              "API Keys",
              "Usage",
              "Alerts",
            ]}
            active="Members"
            title="Members"
            description="Invite people to Acme AI and choose what they can do."
            action={
              <span
                data-tt="invite-open"
                className="flex h-8 items-center gap-1.5 rounded-md bg-tc-primary px-3.5 text-[12px] font-medium text-tc-primary-fg"
              >
                <UserPlus className="h-3.5 w-3.5" /> Invite members
              </span>
            }
          >
            <Card className="overflow-hidden">
              <div className="grid grid-cols-[1.5fr_0.7fr_1fr] border-b border-tc-fg/10 px-4 py-2 font-jetBrainsMono text-[10px] uppercase text-tc-fg/45">
                <span>Member</span>
                <span>Role</span>
                <span>Project access</span>
              </div>
              {MEMBERS.map((m) => (
                <div
                  key={m.email}
                  className="grid grid-cols-[1.5fr_0.7fr_1fr] items-center border-b border-tc-fg/10 px-4 py-2.5 text-[12px] last:border-0"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tc-fg/10 text-[10.5px] font-semibold">
                      {m.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <span>
                      <span className="block font-medium">{m.name}</span>
                      <span className="text-[11px] text-tc-fg/45">
                        {m.email}
                      </span>
                    </span>
                  </span>
                  <span className="w-fit rounded-full bg-tc-fg/[0.07] px-2 py-0.5 text-[10.5px]">
                    {m.role}
                  </span>
                  <span className="truncate text-tc-fg/60">{m.access}</span>
                </div>
              ))}
            </Card>
            <Overline className="mt-5">Pending invitations</Overline>
            <Card className="mt-2 overflow-hidden">
              {invited ? (
                <div className="tour-rise grid grid-cols-[1.5fr_0.7fr_1fr] items-center px-4 py-2.5 text-[12px]">
                  <span>
                    <span className="block font-medium">
                      taylor@acme.example
                    </span>
                    <span className="text-[11px] text-tc-fg/45">
                      Expires in 7 days
                    </span>
                  </span>
                  <span className="w-fit rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] text-amber-600 dark:text-amber-400">
                    Member
                  </span>
                  <span className="text-tc-fg/60">All projects</span>
                </div>
              ) : (
                <div className="px-4 py-3 text-[12px] text-tc-fg/45">
                  No pending invitations
                </div>
              )}
            </Card>
          </SettingsLayout>
        </div>
      )}

      {/* Invite dialog */}
      <div
        className={cn(
          "absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          dialog ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "w-[480px] overflow-hidden rounded-xl border border-tc-fg/10 bg-tc-card shadow-2xl transition-transform duration-300",
            dialog ? "scale-100" : "scale-[0.98]",
          )}
        >
          <div className="border-b border-tc-fg/10 px-6 py-4">
            <div className="text-[16px] font-semibold">Invite members</div>
            <div className="mt-0.5 text-[12px] text-tc-fg/55">
              They get an email with a link to join Acme AI.
            </div>
          </div>
          <div className="flex flex-col gap-3.5 px-6 py-5 text-[12px]">
            <div>
              <div className="font-medium">Email addresses</div>
              <span
                data-tt="invite-email"
                className={cn(
                  "mt-1.5 flex h-9 items-center rounded-md border bg-tc-bg px-3",
                  at("team-send", 2) ? "border-tc-fg/60" : "border-tc-fg/15",
                )}
              >
                {at("team-send", 2) ? (
                  <Typed
                    text="taylor@acme.example"
                    state={typeState(props, "team-send", 2, 3)}
                  />
                ) : (
                  <span className="text-tc-fg/35">name@company.com</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="font-medium">Role</div>
                <span className="mt-1.5 flex h-9 items-center justify-between rounded-md border border-tc-fg/15 bg-tc-bg px-3">
                  Member <ChevronDown className="h-3.5 w-3.5 text-tc-fg/50" />
                </span>
              </div>
              <div>
                <div className="font-medium">Project access</div>
                <span className="mt-1.5 flex h-9 items-center justify-between rounded-md border border-tc-fg/15 bg-tc-bg px-3">
                  All projects{" "}
                  <ChevronDown className="h-3.5 w-3.5 text-tc-fg/50" />
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-tc-fg/10 bg-tc-fg/[0.04] px-6 py-3.5">
            <span className="px-3 py-2 text-[12px] font-medium">Cancel</span>
            <span
              data-tt="invite-send"
              className="flex h-8 items-center rounded-md bg-tc-primary px-4 text-[12px] font-medium text-tc-primary-fg"
            >
              Send invite
            </span>
          </div>
        </div>
      </div>

      <Toast
        show={props.step.id === "team-projects" && props.stage >= 1}
        title="Invitation sent"
        body="taylor@acme.example can join Acme AI for the next 7 days."
      />
    </div>
  );
}

/** A project page with its monthly budget. */
export function ProjectsScene(props: SceneProps) {
  const { at } = props;
  const dialog = at("team-budget", 2) && !at("team-done");
  const saved = at("team-done");

  return (
    <div className="relative flex h-full flex-col bg-tc-bg">
      <ConsoleNav active="Projects" org="Acme AI" />
      <div className="flex items-center border-b border-tc-fg/10 px-10 py-3">
        <div className="text-[12px] text-tc-fg/50">Projects /</div>
        <div className="ml-1.5 flex items-center gap-2 text-[20px] font-bold tracking-tight">
          <FolderKanban className="h-5 w-5 text-tc-fg/50" /> inference
        </div>
        <span
          data-tt="set-budget"
          className="ml-auto flex h-8 items-center rounded-md border border-tc-fg/15 px-3 text-[12px] font-medium"
        >
          Set budget
        </span>
        <span className="ml-2 flex h-8 items-center rounded-md bg-tc-primary px-3 text-[12px] font-medium text-tc-primary-fg">
          New deployment
        </span>
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_300px] gap-6 bg-[radial-gradient(circle,rgb(var(--tc-fg)/0.035)_2px,transparent_2px)] px-10 py-6 [background-size:26px_26px]">
        <div className="flex flex-col gap-3">
          <Card className="p-4">
            <div className="flex items-center">
              <Overline>Budget · October</Overline>
              <span className="ml-auto text-[11.5px] text-tc-fg/55">
                {saved ? "Alert at 80%" : "No budget set"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-bold tabular-nums tracking-tight">
                $1,214
              </span>
              <span className="text-[12px] text-tc-fg/55">
                {saved
                  ? "of $2,000 deposited this month"
                  : "deposited this month"}
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-tc-fg/10">
              <div
                className="h-full rounded-full bg-tc-fg/70 transition-[width] duration-700"
                style={{ width: saved ? "61%" : "0%" }}
              />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-tc-fg/10 px-4 py-2 font-jetBrainsMono text-[10px] uppercase text-tc-fg/45">
              Deployments
            </div>
            {[
              ["llama-chat", "1× H100 · Running"],
              ["embeddings", "1× A100 · Running"],
            ].map(([name, meta]) => (
              <div
                key={name}
                className="flex items-center border-b border-tc-fg/10 px-4 py-2.5 text-[12px] last:border-0"
              >
                <b className="font-semibold">{name}</b>
                <span className="ml-auto text-tc-fg/55">{meta}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <Overline>Recent activity</Overline>
          <Card className="mt-2 p-3 text-[11.5px]">
            {[
              saved && "Sam set a $2,000 budget on inference",
              "Sam invited taylor@acme.example as Member",
              "Jordan deployed llama-chat to inference",
            ]
              .filter((x): x is string => typeof x === "string")
              .map((line) => (
                <div
                  key={line}
                  className="tour-rise flex gap-2 py-1.5 text-tc-fg/70"
                >
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-tc-fg/40" />{" "}
                  {line}
                </div>
              ))}
          </Card>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          dialog ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="w-[440px] overflow-hidden rounded-xl border border-tc-fg/10 bg-tc-card shadow-2xl">
          <div className="border-b border-tc-fg/10 px-6 py-4">
            <div className="text-[16px] font-semibold">Set budget</div>
            <div className="mt-0.5 text-[12px] text-tc-fg/55">
              Counted per calendar month in UTC.
            </div>
          </div>
          <div className="flex flex-col gap-3.5 px-6 py-5 text-[12px]">
            <div>
              <div className="font-medium">Monthly budget (USD)</div>
              <span className="mt-1.5 flex h-9 items-center rounded-md border border-tc-fg/60 bg-tc-bg px-3 tabular-nums">
                <Typed
                  text="2,000"
                  state={typeState(props, "team-budget", 2, 3)}
                  speed={90}
                />
              </span>
            </div>
            <div>
              <div className="font-medium">Alert threshold (%)</div>
              <span className="mt-1.5 flex h-9 items-center rounded-md border border-tc-fg/15 bg-tc-bg px-3 tabular-nums">
                80
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Stop top-ups when over budget</span>
              <Toggle on={false} className="ml-auto" />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-tc-fg/10 bg-tc-fg/[0.04] px-6 py-3.5">
            <span className="px-3 py-2 text-[12px] font-medium">Cancel</span>
            <span
              data-tt="save-budget"
              className="flex h-8 items-center rounded-md bg-tc-primary px-4 text-[12px] font-medium text-tc-primary-fg"
            >
              Save budget
            </span>
          </div>
        </div>
      </div>
      <Toast
        show={saved}
        title="Budget saved"
        body="inference now has a $2,000 monthly budget."
      />
    </div>
  );
}
