import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Card = {
  wide: boolean
  title: string
  description: string
  image?: string
}

const CARDS: Card[] = [
  {
    wide: true,
    title: 'Docker Native',
    description:
      'No refactoring. If it runs in a container, it runs on Akash. Migrate your stack from legacy providers with zero changes to your application code.',
    image: '/images/infra/docker-native.webp',
  },
  {
    wide: false,
    title: 'Train 3x Longer',
    description:
      'H100s for $1.33/hr vs AWS at $3.93/hr. Get nearly 3 hours of compute for the price of 1. Transparent pricing, no hidden fees.',
    image: '/images/infra/pricing.webp',
  },
  {
    wide: false,
    title: '1-Click Templates',
    description:
      'Launch pre-configured environments for Llama 3, DeepSeek, and Stable Diffusion in seconds. Move from configuration to active container in less than 60 seconds.',
    image: '/images/infra/templates.webp',
  },
  {
    wide: true,
    title: 'Global Silicon Supply',
    description:
      'Access enterprise-grade H100s and A100s alongside high-performance consumer RTX 5090s. Scale from single-node inference to massive interconnected training clusters on demand.',
    image: '/images/infra/global-supply.webp',
  },
  {
    wide: false,
    title: 'Ray Distributed Clusters',
    description:
      'Scale your machine learning workloads instantly. Provision multi-node Ray clusters to train and fine-tune large-scale models natively, eliminating complex manual cluster orchestration.',
    image: '/images/infra/ray.webp',
  },
  {
    wide: false,
    title: 'Operational Autonomy',
    description:
      'Retain absolute control over your network routing and data residency. Moving away from closed, proprietary ecosystems protects your application stack from single-provider lock-in and vendor dependencies.',
    image: '/images/infra/autonomy.webp',
  },
]

const CONTAINER_PADDING = 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))'

// Step 1 → Ray Distributed Clusters right-aligned, Step 2 → Operational Autonomy right-aligned
const SCROLL_TARGETS = [4, 5]
const TOTAL_CARDS = CARDS.length  // 6

export function InfraCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  )
  const dragging = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollStart = useRef(0)

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragging.current = true
    dragStartX.current = e.clientX
    dragScrollStart.current = scrollRef.current?.scrollLeft ?? 0
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !scrollRef.current) return
    scrollRef.current.scrollLeft = dragScrollStart.current - (e.clientX - dragStartX.current)
  }
  const onPointerUp = () => { dragging.current = false }

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
      <div className="mb-10" style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING, maxWidth: 'calc(1280px + 2 * max(1.5rem, (100vw - 1280px) / 2 + 1.5rem))', marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
          The Open Supercloud for&nbsp;AI
        </h2>
        <p className="mt-3 max-w-lg text-sm text-para">
          Stop overpaying for gated compute. Deploy on a global marketplace of high-density GPUs
          to maximize your engineering runway.
        </p>
      </div>

      {/* Carousel — full bleed, left-padded to container edge */}
      <div
        ref={scrollRef}
        className="flex gap-6 lg:gap-8 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
        style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {CARDS.map((card) => (
          <div
            key={card.title}
            className={cn(
              'shrink-0',
              card.wide
                ? 'w-[280px] sm:w-[420px] lg:w-[620px]'
                : 'w-[220px] sm:w-[270px] lg:w-[350px]',
            )}
          >
            <div
              className={cn(
                'mb-4 w-full overflow-hidden rounded-xl border border-border bg-card',
                'h-[280px] sm:h-[340px] lg:h-[400px]',
              )}
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  className="block h-full w-full object-cover object-center"
                />
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground sm:text-xl lg:text-2xl">
              {card.title}
            </h3>
            <p className={cn(
              'mt-3 text-xs leading-relaxed text-para lg:text-sm',
              card.wide && 'max-w-sm',
            )}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Arrows — contained */}
      <div
        className="mt-6 flex justify-end gap-2"
        style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING, maxWidth: 'calc(1280px + 2 * max(1.5rem, (100vw - 1280px) / 2 + 1.5rem))', marginLeft: 'auto', marginRight: 'auto' }}
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
