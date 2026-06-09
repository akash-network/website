import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TimeZoneCalendar from "@/components/development-pages/time-zone-calendar";
import { ChevronRight } from "lucide-react";

const govGroups = [
  {
    abbr: "SIG",
    name: "Special Interest Groups",
    desc: "Focused, persistent groups working on specific features, products, and foundational tools. SIGs exist as long as the work does.",
    href: "/development/community-groups/#special-interest-groups",
  },
  {
    abbr: "WG",
    name: "Working Groups",
    desc: "Large-scale initiatives that span multiple SIGs. They form around a mission and dissolve once the work ships. The work outlasts the group.",
    href: "/development/community-groups/#working-groups",
  },
  {
    abbr: "SC",
    name: "Steering Committee",
    desc: "Oversees the project list, resolves conflicts, and ensures the community keeps improving how it operates.",
    href: "/development/community-groups/#steering-committee",
  },
];

export default function CommunitySyncsContent() {
  return (
    <section className="px-6 pb-4 pt-0 md:px-10 md:pb-10 md:pt-3 lg:pb-10 lg:pt-3">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8">
        <div className="space-y-4">
          <h2 className="font-sans text-3xl font-medium leading-snug tracking-tight text-foreground md:text-4xl">
            Build in the open
          </h2>
          <p className="max-w-2xl text-base font-normal text-para">
            Akash is run by the people who build it. From persistent domain groups to mission-specific initiatives, our work happens in public meetings that anyone can join.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {govGroups.map((g, i) => (
            <a key={i} href={g.href} className="block h-full">
              <Card className="group flex h-full cursor-pointer flex-col transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20">
                <CardHeader>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border text-xs font-medium text-iconText">
                    {g.abbr}
                  </span>
                  <CardTitle className="text-lg font-semibold">{g.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <CardDescription className="text-sm font-normal leading-relaxed">
                    {g.desc}
                  </CardDescription>
                  <div className="mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-md border bg-transparent px-3 text-xs font-medium text-foreground shadow-sm transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-badgeColor">
                    Learn More<ChevronRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-base font-medium text-foreground">Community Syncs Calendar</p>
          <div className="overflow-hidden rounded-xl border bg-card p-4 md:p-6">
            <TimeZoneCalendar
              calendarId="c_25e5e3748e4c4ab7a55f41fbc5ebebcc0a03b40fb028785f14159bfaebea12e2@group.calendar.google.com"
              height={380}
            />
          </div>
          <div className="flex justify-center pt-2">
            <a
              href="https://calendar.google.com/calendar/u/0?cid=Y18yNWU1ZTM3NDhlNGM0YWI3YTU1ZjQxZmJjNWViZWJjYzBhMDNiNDBmYjAyODc4NWYxNDE1OWJmYWViZWExMmUyQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-badgeColor"
            >
              Subscribe to Community Calendar<ChevronRight size={14} className="ml-1.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
