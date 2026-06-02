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

type AnimPhase = 'hidden' | 'animating' | 'done'

export function InfraCarousel() {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  )
  const [animPhase, setAnimPhase] = useState<AnimPhase>('hidden')
  const dragging = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollStart = useRef(0)

  // Ref bundle keeps wheel handler free of stale closures
  const scrollStateRef = useRef({ step: 0, atStart: true, atEnd: false, isMobile: false, animDone: false })
  useEffect(() => {
    scrollStateRef.current = { step, atStart, atEnd, isMobile: isMobileView, animDone: animPhase === 'done' }
  }, [step, atStart, atEnd, isMobileView, animPhase])

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Two RAF cycles ensure the hidden state is painted before transition starts
          requestAnimationFrame(() => requestAnimationFrame(() => {
            setAnimPhase('animating')
            setTimeout(() => setAnimPhase('done'), CARDS.length * 70 + 800)
          }))
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Sync button state and dots with actual scroll position
  useEffect(() => {
    if (animPhase !== 'done') return
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      const isAtStart = el.scrollLeft < 5
      const isAtEnd = el.scrollLeft >= maxScroll - 5
      setAtStart(isAtStart)
      setAtEnd(isAtEnd)
      if (isMobileView) {
        const children = Array.from(el.children) as HTMLElement[]
        const containerMid = el.getBoundingClientRect().left + el.offsetWidth / 2
        let closest = 0
        let minDist = Infinity
        children.forEach((child, i) => {
          const dist = Math.abs(child.getBoundingClientRect().left + child.offsetWidth / 2 - containerMid)
          if (dist < minDist) { minDist = dist; closest = i }
        })
        setStep(closest)
      } else {
        // Keep step in sync on desktop so button-driven scroll targets stay correct after dragging
        if (isAtStart) setStep(0)
        else if (isAtEnd) setStep(SCROLL_TARGETS.length)
        else setStep(1)
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isMobileView, animPhase])

  // Hijack vertical wheel → advance carousel horizontally (desktop only)
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let cooldown = false

    const handleWheel = (e: WheelEvent) => {
      const { isMobile, atStart: _atStart, atEnd: _atEnd, step: _step, animDone } = scrollStateRef.current
      if (isMobile || !animDone) return

      const rect = wrapper.getBoundingClientRect()
      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      // wrapperRef top (= headline top) should sit this many px below viewport top when locked
      const TARGET = 60

      // Going down: engage when section top is within 40px of the lock position
      // Going up: wider ±150px window so coarse trackpad events can't skip past re-engagement
      const inFocusDown = goingDown && rect.top <= TARGET + 40 && rect.bottom > 100
      const inFocusUp = goingUp && rect.top >= TARGET - 150 && rect.top <= TARGET + 5 && rect.bottom > 0
      if (!inFocusDown && !inFocusUp) return

      // Release vertical scroll at the carousel boundaries
      if (goingDown && _atEnd) return
      if (goingUp && _atStart) return

      e.preventDefault()
      if (cooldown) return
      cooldown = true
      setTimeout(() => { cooldown = false }, 700)

      // Snap wrapper to TARGET — only in the matching direction so we never emit a scroll-up
      // event during downward traversal (which would trigger the navbar's show-on-scroll-up)
      if (goingDown && rect.top > TARGET + 2) {
        window.scrollTo({ top: window.scrollY + (rect.top - TARGET), behavior: 'instant' })
      } else if (goingUp && rect.top < TARGET - 2) {
        window.scrollTo({ top: window.scrollY + (rect.top - TARGET), behavior: 'instant' })
      }

      const el = scrollRef.current
      if (!el) return

      if (goingDown) {
        const next = Math.min(_step + 1, SCROLL_TARGETS.length)
        scrollStateRef.current.step = next
        setStep(next)
        const card = (Array.from(el.children) as HTMLElement[])[SCROLL_TARGETS[next - 1]]
        if (card) {
          const paddingRight = parseFloat(getComputedStyle(el).paddingRight)
          const delta = card.getBoundingClientRect().right - (el.getBoundingClientRect().right - paddingRight)
          el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
        }
      } else {
        const next = Math.max(_step - 1, 0)
        scrollStateRef.current.step = next
        setStep(next)
        if (next === 0) {
          el.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          const card = (Array.from(el.children) as HTMLElement[])[SCROLL_TARGETS[next - 1]]
          if (card) {
            const paddingRight = parseFloat(getComputedStyle(el).paddingRight)
            const delta = card.getBoundingClientRect().right - (el.getBoundingClientRect().right - paddingRight)
            el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
          }
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, []) // empty deps — all live state read from scrollStateRef

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
  const canLeft = !atStart
  const canRight = !atEnd

  const scrollToCardRight = (cardIndex: number) => {
    const el = scrollRef.current
    if (!el) return
    const card = (Array.from(el.children) as HTMLElement[])[cardIndex]
    if (!card) return
    const paddingRight = parseFloat(getComputedStyle(el).paddingRight)
    const delta = card.getBoundingClientRect().right - (el.getBoundingClientRect().right - paddingRight)
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
  }

  const scrollToCardLeft = (cardIndex: number) => {
    const el = scrollRef.current
    if (!el) return
    const card = (Array.from(el.children) as HTMLElement[])[cardIndex]
    if (!card) return
    const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft)
    el.scrollTo({ left: card.offsetLeft - paddingLeft, behavior: 'smooth' })
  }

  const goToCard = (i: number) => {
    setStep(i)
    if (i === 0) scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
    else scrollToCardLeft(i)
  }

  const scroll = (dir: 'left' | 'right') => {
    if (dir === 'right' && canRight) {
      const next = Math.min(step + 1, maxStep)
      setStep(next)
      if (isMobileView) scrollToCardRight(next)
      else scrollToCardRight(SCROLL_TARGETS[next - 1])
    } else if (dir === 'left' && canLeft) {
      const next = Math.max(step - 1, 0)
      setStep(next)
      if (next === 0) scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
      else if (isMobileView) scrollToCardRight(next)
      else scrollToCardRight(SCROLL_TARGETS[next - 1])
    }
  }

  return (
    <div ref={wrapperRef} className="w-full">
      {/* Header — contained */}
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING, maxWidth: 'calc(1280px + 2 * max(1.5rem, (100vw - 1280px) / 2 + 1.5rem))', marginLeft: 'auto', marginRight: 'auto' }}>
        <div>
          <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
            Supercloud for AI
          </h2>
          <p className="mt-3 max-w-lg text-sm text-para">
            Stop overpaying for gated compute. Deploy on a global marketplace of high-density GPUs
            to maximize your engineering runway.
          </p>
        </div>
        {/* Buttons — desktop only */}
        <div className="hidden shrink-0 gap-2 lg:flex">
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

      {/* Carousel — full bleed, left-padded to container edge */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-6 lg:gap-8 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          animPhase === 'done'
            ? 'overflow-x-auto cursor-grab active:cursor-grabbing'
            : 'overflow-x-hidden',
        )}
        style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING }}
        onPointerDown={animPhase === 'done' ? onPointerDown : undefined}
        onPointerMove={animPhase === 'done' ? onPointerMove : undefined}
        onPointerUp={animPhase === 'done' ? onPointerUp : undefined}
        onPointerLeave={animPhase === 'done' ? onPointerUp : undefined}
      >
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            className={cn(
              'shrink-0',
              card.wide
                ? 'w-[280px] sm:w-[420px] lg:w-[620px]'
                : 'w-[220px] sm:w-[270px] lg:w-[350px]',
            )}
            style={
              animPhase === 'hidden'
                ? { opacity: 0, transform: 'translateX(80px)' }
                : animPhase === 'animating'
                ? {
                    opacity: 1,
                    transform: 'translateX(0)',
                    transition: `transform 0.75s cubic-bezier(0.34,1.2,0.64,1) ${i * 70}ms, opacity 0.5s ease-out ${i * 60}ms`,
                  }
                : undefined
            }
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

      {/* Dots — mobile only, below carousel */}
      <div className="mt-8 flex justify-center lg:hidden" style={{ paddingLeft: CONTAINER_PADDING, paddingRight: CONTAINER_PADDING }}>
        <div className="flex items-center gap-2">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => goToCard(i)}
              aria-label={`Go to card ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                step === i ? 'w-6 bg-foreground' : 'w-1.5 bg-border',
              )}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
