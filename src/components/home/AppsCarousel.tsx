import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type App = {
  title: string
  description: string
  url: string
  cta: string
  image?: string
}

const APPS: App[] = [
  {
    title: 'Akash Console',
    description:
      'Deploy clusters and ship containers in sixty seconds. No hidden abstractions. Full control over every lease and bid.',
    url: 'https://console.akash.network',
    cta: 'Deploy Now',
    image: '/development/portal-console.webp',
  },
  {
    title: 'AkashML',
    description:
      'Access scalable open-weight models via an OpenAI-compatible inference API. Retain complete control over data privacy while optimizing your production inference workloads.',
    url: 'https://chatapi.akash.network',
    cta: 'Try AkashML',
    image: '/development/portal-akashml.webp',
  },
  {
    title: 'Provider Console',
    description:
      'Connect your data center or hardware infrastructure directly to the global network. Automate resource listing, manage network configurations, and verify operational earnings natively.',
    url: 'https://provider-console.akash.network',
    cta: 'Become a Provider',
    image: '/development/portal-provider.webp',
  },
  {
    title: 'Akash Homenode',
    description:
      'Provision consumer-grade GPU hardware onto the global compute network. Automate node setup and network configuration to list your idle silicon on the marketplace without complex manual cluster orchestration.',
    url: 'https://homenode.akash.network',
    cta: 'Try Homenode',
    image: '/development/portal-homenode.webp',
  },
  {
    title: 'Console Air',
    description:
      'A lightweight, self-hostable interface for self-custody deployment management. Securely manage your private keys, execute on-chain deployment transactions, and control your active leases directly.',
    url: 'https://github.com/akash-network/console-air',
    cta: 'View on GitHub',
    image: '/development/portal-console-air.webp',
  },
  {
    title: 'Akash Chat',
    description:
      'Evaluate the latest open-source large language models on an interface powered entirely by the global GPU grid. Benchmark inference speeds and performance across independent provider networks.',
    url: 'https://chat.akash.network',
    cta: 'Open Chat',
    image: '/images/apps-chat.webp',
  },
  {
    title: 'Akash Gen',
    description:
      'Experience high-performance, open-source image generation running on distributed cloud infrastructure. Orchestrate demanding diffusion models at native market rates with zero vendor lock-in.',
    url: 'https://gen.akash.network',
    cta: 'Try Gen',
    image: '/images/apps-gen.webp',
  },
  {
    title: 'Akash Agents',
    description:
      'An experimental sandbox for testing autonomous agent workflows. Evaluate how long-running, persistent script workloads and background tasks execute natively across distributed compute providers.',
    url: 'https://agents.akash.network/',
    cta: 'Learn More',
    image: '/images/apps-agents.webp',
  },
]

const CONTAINER_PADDING = 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))'

// Step 1 → Akash Chat (index 5), Step 2 → Akash Agents (index 7), Step 3 → Stats card (index 8)
const SCROLL_TARGETS = [5, 7, 8]
const TOTAL_CARDS = APPS.length + 1  // 8 apps + stats card

export function AppsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  )
  const dragging = useRef(false)
  const didDrag = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollStart = useRef(0)

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragging.current = true
    didDrag.current = false
    dragStartX.current = e.clientX
    dragScrollStart.current = scrollRef.current?.scrollLeft ?? 0
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !scrollRef.current) return
    const dx = e.clientX - dragStartX.current
    if (Math.abs(dx) > 4) didDrag.current = true
    scrollRef.current.scrollLeft = dragScrollStart.current - dx
  }
  const onPointerUp = () => { dragging.current = false }
  const onClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) { e.preventDefault(); e.stopPropagation() }
  }

  const maxStep = isMobileView ? TOTAL_CARDS - 1 : SCROLL_TARGETS.length
  const canLeft = step > 0
  const canRight = step < maxStep

  const scrollToCardRight = (cardIndex: number) => {
    const el = scrollRef.current
    if (!el) return
    const card = (Array.from(el.children) as HTMLElement[])[cardIndex]
    if (!card) return
    const paddingRight = parseFloat(getComputedStyle(el).paddingRight)
    const delta = card.getBoundingClientRect().right - (el.getBoundingClientRect().right - paddingRight)
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
  }

  const scroll = (dir: 'left' | 'right') => {
    if (dir === 'right' && step < maxStep) {
      const next = step + 1
      setStep(next)
      if (isMobileView) scrollToCardRight(next)
      else scrollToCardRight(SCROLL_TARGETS[next - 1])
    } else if (dir === 'left' && step > 0) {
      const next = step - 1
      setStep(next)
      if (next === 0) scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
      else if (isMobileView) scrollToCardRight(next)
      else scrollToCardRight(SCROLL_TARGETS[next - 1])
    }
  }


  return (
    <div className="w-full">
      {/* Header — contained */}
      <div
        className="mb-10"
        style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING }}
      >
        <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
          The Akash App Suite
        </h2>
        <p className="mt-3 max-w-lg text-sm text-para">
          Every tool you need to build, deploy, and earn on the open cloud. From managed
          inference to self-custody infrastructure.
        </p>
      </div>

      {/* Carousel — full bleed */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pt-2 -mt-2 pb-10 -mb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
        style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {APPS.map((app) => (
          <a
            key={app.title}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block shrink-0 w-[290px] sm:w-[320px] lg:w-[420px]"
          >
            <Card className="group h-full cursor-pointer bg-background transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:bg-card dark:hover:shadow-black/20">
              <div className="flex h-full flex-col gap-3 p-4 md:gap-5 md:p-6">
                <div className="overflow-hidden rounded-lg">
                  {app.image ? (
                    <img
                      src={app.image}
                      alt={app.title}
                      draggable={false}
                      className="h-44 w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03] group-hover:brightness-105"
                    />
                  ) : (
                    <div className="h-44 w-full flex items-center justify-center rounded-lg bg-muted text-4xl font-bold text-border select-none">
                      {app.title.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{app.title}</h3>
                <p className="text-sm font-normal leading-relaxed text-para">{app.description}</p>
                <div className="mt-auto pt-1">
                  <div className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-xs font-medium text-foreground shadow-sm transition-colors group-hover:bg-accent dark:group-hover:bg-accent">
                    {app.cta}
                    <ChevronRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Card>
          </a>
        ))}

        {/* Stats card */}
        <a
          href="https://stats.akash.network"
          target="_blank"
          rel="noopener noreferrer"
          className="block shrink-0 w-[290px] sm:w-[320px] lg:w-[420px]"
        >
          <Card className="group h-full cursor-pointer bg-background transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:bg-card dark:hover:shadow-black/20">
            <div className="flex h-full flex-col gap-5 p-6">
              <div className="overflow-hidden rounded-lg">
                <img src="/images/apps-stats.webp" alt="Akash Stats" draggable={false} className="block h-44 w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03] group-hover:brightness-105" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Akash Stats</h3>
              <p className="text-sm font-normal leading-relaxed text-para">
                Real-time network analytics and ledger monitoring. Track live GPU utilization, active on-chain leases, deployment trends, and network transaction volume.
              </p>
              <div className="mt-auto pt-1">
                <div className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-xs font-medium text-foreground shadow-sm transition-colors group-hover:bg-accent dark:group-hover:bg-accent">
                  View Stats
                  <ChevronRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Card>
        </a>

      </div>

      {/* Arrows — contained */}
      <div
        className="mt-6 flex justify-end gap-2"
        style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canLeft}
          aria-label="Scroll left"
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canRight}
          aria-label="Scroll right"
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
