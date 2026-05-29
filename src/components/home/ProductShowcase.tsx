import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronRight, Play, Pause } from 'lucide-react'

const DUR = 5000

const PRODUCTS = [
  {
    title: 'Accelerate AI on AkashML',
    description: 'Rent high-performance GPUs instantly for machine learning workloads. Launch pre-configured environments for model training, fine-tuning, and inference without the complex infrastructure setup.',
    image: '/images/get-started-akashML.webp',
    imageSmall: '/images/get-started-akashML.webp',
    url: 'https://akashml.com',
    buttonLabel: 'Launch AkashML',
  },
  {
    title: 'Deploy on Akash Console',
    description: 'Migrate your Docker containers to an independent cloud network. Use pre-built templates or supply an SDL configuration file to spin up raw compute directly on sovereign infrastructure.',
    image: '/images/get-started-console.webp',
    imageSmall: '/images/get-started-console.webp',
    url: 'https://console.akash.network',
    buttonLabel: 'Deploy Now',
  },
  {
    title: 'Become a Compute Provider',
    description: 'Monetize your idle server capacity. Run our provider software to list your GPU and CPU hardware on the global network and automatically earn revenue from enterprise deployments.',
    image: '/images/get-started-provider.webp',
    imageSmall: '/images/get-started-provider.webp',
    url: 'https://provider-console.akash.network',
    buttonLabel: 'Become a Provider',
  },
]

export function ProductShowcase() {
  const [cur, setCur]       = useState(0)
  const [playing, setPlaying] = useState(true)
  const [fillPct, setFillPct] = useState(0)
  const rafRef     = useRef<number | null>(null)
  const startRef   = useRef<number>(performance.now())
  const playingRef = useRef(true)
  const curRef        = useRef(0)
  const isDragging    = useRef(false)
  const dragStartX    = useRef(0)
  const dragOffsetRef = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const carouselRef   = useRef<HTMLDivElement>(null)

  const startTimer = () => {
    startRef.current = performance.now()

    const tick = () => {
      if (!playingRef.current) return
      const el = performance.now() - startRef.current
      if (el >= DUR) {
        setFillPct(100)
        setTimeout(() => {
          const next = (curRef.current + 1) % PRODUCTS.length
          curRef.current = next
          setCur(next)
          setFillPct(0)
          startRef.current = performance.now()
          rafRef.current = requestAnimationFrame(tick)
        }, 80)
        return
      }
      setFillPct((el / DUR) * 100)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      const dx = e.touches[0].clientX - dragStartX.current
      if (Math.abs(dx) > 10) e.preventDefault()
      let offset = dx
      if (curRef.current === 0) offset = Math.min(0, offset)
      if (curRef.current === PRODUCTS.length - 1) offset = Math.max(0, offset)
      dragOffsetRef.current = offset
      setDragOffset(offset)
    }
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', handleTouchMove)
  }, [])

  const goTo = (n: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    curRef.current = n
    setCur(n)
    setFillPct(0)
    if (playingRef.current) startTimer()
  }

  const togglePlay = () => {
    const next = !playing
    setPlaying(next)
    playingRef.current = next
    if (next) {
      startTimer()
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }

  const onDragStart = (clientX: number) => {
    isDragging.current = true
    dragStartX.current = clientX
    dragOffsetRef.current = 0
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return
    let offset = clientX - dragStartX.current
    if (curRef.current === 0) offset = Math.min(0, offset)
    if (curRef.current === PRODUCTS.length - 1) offset = Math.max(0, offset)
    dragOffsetRef.current = offset
    setDragOffset(offset)
  }

  const onDragEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const offset = dragOffsetRef.current
    setDragOffset(0)
    dragOffsetRef.current = 0
    if (offset > 50 && curRef.current > 0) {
      goTo(curRef.current - 1)
    } else if (offset < -50 && curRef.current < PRODUCTS.length - 1) {
      goTo(curRef.current + 1)
    } else if (playingRef.current) {
      startTimer()
    }
  }

  const progressControls = (
    <>
      <div className="flex h-[28px] items-center gap-2 rounded-md border border-black/10 dark:border-white/15 bg-background px-2.5 dark:bg-card">
        {PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'relative h-1.5 overflow-hidden rounded-full transition-all duration-300',
              cur === i ? 'w-16 bg-border/40 dark:bg-defaultBorder' : 'w-1.5 bg-border',
            )}
          >
            {cur === i && (
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                style={{ width: `${fillPct}%`, transition: 'none' }}
              />
            )}
          </button>
        ))}
      </div>
      <Button
        onClick={togglePlay}
        variant="ghost"
        size="icon"
        aria-label={playing ? 'Pause' : 'Play'}
        className="h-[28px] w-[28px] shrink-0 rounded-md border border-black/10 dark:border-white/15 bg-background hover:bg-accent dark:bg-card"
      >
        {playing
          ? <Pause className="h-3 w-3" />
          : <Play className="h-3 w-3" />
        }
      </Button>
    </>
  )

  return (
    <>
      {/* ── Mobile carousel ── */}
      <div className="flex flex-col lg:hidden">
        <div className="mb-12">
          <h2 className="text-[28px] font-semibold leading-tight text-foreground">
            Get Started
          </h2>
        </div>

        <div
          ref={carouselRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
          onTouchCancel={onDragEnd}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseMove={(e) => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        >
          <div
            className="flex gap-6"
            style={{
              transform: `translateX(calc(${cur} * (-100% - 1.5rem) + ${dragOffset}px))`,
              transition: isDragging.current ? 'none' : 'transform 300ms ease-in-out',
            }}
          >
            {PRODUCTS.map((product, i) => (
              <div key={i} className="w-full shrink-0">
                <div className="mb-5">
                  <p className="mb-3 text-lg font-semibold leading-snug text-foreground">
                    {product.title}
                  </p>
                  <p className="text-sm leading-relaxed text-para">{product.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mt-5 h-7 gap-1.5 px-3 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      {product.buttonLabel}
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-border" style={{ aspectRatio: '1 / 1' }}>
                  <img
                    src={product.image}
                    srcSet={`${product.imageSmall} 1200w, ${product.image} 1600w`}
                    sizes="100vw"
                    alt={product.title}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex h-[28px] items-stretch rounded-md border border-black/10 dark:border-white/15 bg-background px-1 dark:bg-card">
            {PRODUCTS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="flex items-center px-1.5"
              >
                <div className={cn(
                  'relative h-1.5 overflow-hidden rounded-full transition-all duration-300',
                  cur === i ? 'w-16 bg-border/40 dark:bg-defaultBorder' : 'w-1.5 bg-border',
                )}>
                  {cur === i && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                      style={{ width: `${fillPct}%`, transition: 'none' }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="flex flex-col lg:order-1">
          <div className="mb-4 md:mb-8">
            <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
              Get Started
            </h2>
          </div>
          <div>
          {PRODUCTS.map((product, i) => (
            <div key={i} className="cursor-pointer" onClick={() => goTo(i)}>
              <div className="py-7">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300',
                    cur === i ? 'bg-foreground' : 'bg-transparent',
                  )} />
                  <p className={cn(
                    'text-lg leading-snug transition-colors md:text-xl lg:text-2xl',
                    cur === i ? 'font-semibold text-foreground' : 'text-para',
                  )}>
                    {product.title}
                  </p>
                </div>
                {cur === i && (
                  <div className="pl-[18px]">
                    <p className="mt-2 text-sm leading-relaxed text-para">
                      {product.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-5 h-7 gap-1.5 px-3 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <a href={product.url} target="_blank" rel="noopener noreferrer">
                        {product.buttonLabel}
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="h-px bg-border/40" />
            </div>
          ))}
          </div>
          <div className="mt-6 flex items-center gap-2">
            {progressControls}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border lg:order-2" style={{ aspectRatio: '1 / 1' }}>
          {PRODUCTS.map((product, i) => (
            <img
              key={i}
              src={product.image}
              srcSet={`${product.imageSmall} 1200w, ${product.image} 1600w`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt={product.title}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500',
                cur === i ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
        </div>
      </div>
    </>
  )
}
