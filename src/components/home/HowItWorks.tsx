import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, ArrowRight, ChevronRight } from 'lucide-react'

const DUR = 6000

const STEPS = [
  {
    title: 'Configure your deployment',
    body: 'Select a template or supply your own container image. Specify required resources like GPUs, region, and maximum price to send your request out to the network.',
  },
  {
    title: 'Automated bidding',
    body: 'Independent infrastructure providers meeting your exact requirements automatically submit competitive bids in real time. You see who is offering the hardware and the precise rate.',
  },
  {
    title: 'Authorize and execute',
    body: 'Accept the optimal bid to open the lease. The network handles the backend routing instantly, initializing your container and spinning up a live endpoint for your workloads.',
  },
]

const PROVIDERS = [
  { id: 'akash1...4f2a', gpu: '4x A100 80G',  bid: '$3.98', trust: 'L3', delay: 0 },
  { id: 'akash1...c3d8', gpu: '2x A100 80G',  bid: '$1.92', trust: 'L2', delay: 120 },
  { id: 'akash1...2e1f', gpu: '8x A100 40G',  bid: '$4.21', trust: 'L2', delay: 240 },
  { id: 'akash1...9b7a', gpu: '2x A100 80G',  bid: '$2.10', trust: 'L3', delay: 360 },
  { id: 'akash1...6d5c', gpu: '4x A100 40G',  bid: '$2.88', trust: 'L1', delay: 480 },
  { id: 'akash1...8e3b', gpu: '2x A100 80G',  bid: '$1.85', trust: 'L2', delay: 600 },
  { id: 'akash1...1a9c', gpu: '4x A100 80G',  bid: '$3.75', trust: 'L2', delay: 720 },
  { id: 'akash1...5f7d', gpu: '2x A100 80G',  bid: '$1.74', trust: 'L1', delay: 840 }, // cheapest
]

// Subset shown on mobile so the selected (cheapest) row is always visible
const PROVIDERS_MOBILE = [
  { id: 'akash1...4f2a', gpu: '4x A100 80G',  bid: '$3.98', trust: 'L3', delay: 0 },
  { id: 'akash1...c3d8', gpu: '2x A100 80G',  bid: '$1.92', trust: 'L2', delay: 0 },
  { id: 'akash1...2e1f', gpu: '8x A100 40G',  bid: '$4.21', trust: 'L2', delay: 0 },
  { id: 'akash1...9b7a', gpu: '2x A100 80G',  bid: '$2.10', trust: 'L3', delay: 0 },
  { id: 'akash1...5f7d', gpu: '2x A100 80G',  bid: '$1.74', trust: 'L1', delay: 0 }, // cheapest — selected
]

const PROVIDERS_MOBILE_SHORT = [
  { id: 'akash1...4f2a', gpu: '4x A100 80G',  bid: '$3.98', trust: 'L3', delay: 0 },
  { id: 'akash1...2e1f', gpu: '8x A100 40G',  bid: '$4.21', trust: 'L2', delay: 0 },
  { id: 'akash1...5f7d', gpu: '2x A100 80G',  bid: '$1.74', trust: 'L1', delay: 0 },
]
const SELECTED_MOBILE_SHORT_IDX = 2

// Index of the provider that gets "selected" (cheapest)
const SELECTED_PROVIDER_IDX = 7
const SELECTED_MOBILE_IDX   = 4

function TrustBadge({ trust }: { trust: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[10px]',
        trust === 'L3' && 'border-green-800 bg-green-950/50 text-green-400',
        trust === 'L2' && 'border-amber-800 bg-amber-950/50 text-amber-400',
        trust === 'L1' && 'border-defaultBorder text-para',
      )}
    >
      {trust}
    </Badge>
  )
}

const GPU_OPTIONS = [
  { label: 'H200', gpu: '1x H200 SXM',  cpu: '24 cores', memory: '96 GB', price: '$2.59/hr' },
  { label: 'H100', gpu: '1x H100 SXM5', cpu: '16 cores', memory: '80 GB', price: '$1.34/hr' },
  { label: 'A100', gpu: '2x A100 80G',  cpu: '12 cores', memory: '48 GB', price: '$2.00/hr' },
]

// Step 1: staged reveal — template card → config form (0.5s) → GPU cycles H200→H100→A100 → deploy button
function DeployFrame() {
  const [stage, setStage] = useState(0)
  const [gpuIdx, setGpuIdx] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1),   500)   // form fades in (H200)
    const t2 = setTimeout(() => setGpuIdx(1), 1500)   // switch to H100
    const t3 = setTimeout(() => setGpuIdx(2), 2500)   // switch to A100
    const t4 = setTimeout(() => setStage(2),  3000)   // deploy button
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const gpu = GPU_OPTIONS[gpuIdx]

  const staticFields = [
    { label: 'Image', value: 'ollama/ollama:latest' },
    { label: 'Model', value: 'llama3.1:70b' },
  ]
  const dynamicFields = [
    { label: 'GPU',       value: gpu.gpu,    green: true },
    { label: 'CPU',       value: gpu.cpu,    green: false },
    { label: 'Memory',    value: gpu.memory, green: false },
    { label: 'Max price', value: gpu.price,  green: true },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-5 lg:p-8">

      {/* 1. Template card — visible immediately */}
      <div className="hidden lg:block mb-4 overflow-hidden rounded-lg border border-defaultBorder bg-card">
        <div className="h-32 w-full overflow-hidden border-b border-defaultBorder">
          <img src="/images/llama-template.webp" alt="Llama 3.1 70B" className="block h-full w-full object-cover" />
        </div>
        <div className="flex items-center gap-3 px-3 pt-3 pb-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Llama 3.1 70B</p>
          </div>
          <Badge variant="outline" className="border-defaultBorder px-1.5 py-0 text-[9px] text-para">AI</Badge>
        </div>
      </div>

      {/* 2. Configuration form — fades in at 0.5s */}
      <div className={cn(
        'mb-4 rounded-lg border border-defaultBorder bg-card p-4 transition-opacity duration-500',
        stage >= 1 ? 'opacity-100' : 'opacity-0',
      )}>
        {/* GPU selector */}
        <div className="mb-3 flex gap-1.5">
          {GPU_OPTIONS.map((opt, i) => (
            <div key={opt.label} className={cn(
              'flex-1 rounded border px-2 py-1.5 text-center text-[10px] font-medium transition-colors duration-300',
              gpuIdx === i
                ? 'border-foreground/60 bg-foreground text-background'
                : 'border-defaultBorder text-para',
            )}>
              {opt.label}
            </div>
          ))}
        </div>

        {/* Static fields */}
        <div className="mb-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5">
          {staticFields.map(({ label, value }) => (
            <div key={label}>
              <p className="mb-1 text-[9px] uppercase tracking-widest text-para">{label}</p>
              <Input readOnly value={value} className="h-7 border-defaultBorder text-[11px] text-foreground focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
          ))}
        </div>

        {/* Dynamic fields — update with GPU selection */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {dynamicFields.map(({ label, value, green }) => (
            <div key={label}>
              <p className="mb-1 text-[9px] uppercase tracking-widest text-para">{label}</p>
              <Input readOnly value={value} className={cn('h-7 border-defaultBorder text-[11px] focus-visible:ring-0 focus-visible:ring-offset-0', green ? 'text-green-400' : 'text-foreground')} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Deploy button — appears after A100 selected */}
      <Button
        className={cn(
          'w-full bg-foreground text-background hover:bg-foreground transition-opacity duration-500',
          stage >= 2 ? 'opacity-100 animate-pulse' : 'opacity-0',
        )}
        style={{ animationDuration: '2.5s' }}
      >
        Deploy <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// Step 2: providers bidding with optional selected row highlight
function ProvidersFrame({
  visibleRows,
  revealedBids,
  selectedIdx,
  providers: providersList = PROVIDERS,
}: {
  visibleRows: number[]
  revealedBids: number[]
  selectedIdx: number | null
  providers?: typeof PROVIDERS
}) {
  const total       = providersList.length
  const bidCount    = revealedBids.length
  const allReceived = bidCount === total

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 lg:p-8">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <span className="text-xs font-medium text-foreground">Network providers</span>
        <Badge variant="outline" className="border-green-800 bg-green-950/50 font-mono text-[10px] text-green-400">
          63 online
        </Badge>
      </div>

      {/* Bid-receiving status bar */}
      <div
        className={cn(
          'mb-3 flex shrink-0 items-center justify-between rounded-md border px-3 py-2.5 transition-colors duration-500',
          allReceived ? 'border-green-700/60 bg-green-950/40' : 'border-defaultBorder bg-card',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {allReceived ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500/25 text-[10px] text-green-400">✓</span>
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            )}
          </span>
          <span className={cn('text-[11px] font-medium', allReceived ? 'text-green-400' : 'text-foreground')}>
            {allReceived ? (selectedIdx !== null ? 'Bid accepted' : 'All bids received') : 'Receiving bids…'}
          </span>
        </div>
        <span className={cn('font-mono text-[11px] font-medium', allReceived ? 'text-green-400' : 'text-foreground')}>
          {bidCount} <span className="opacity-40">/ {total}</span>
        </span>
      </div>

      <table className="w-full table-fixed border-collapse text-[11px]">
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-defaultBorder">
            {['Provider', 'GPU', 'Bid / hr', 'Trust'].map((h) => (
              <th key={h} className="pb-1.5 pt-1 text-left text-[9px] font-normal uppercase tracking-wider text-para">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {providersList.map((p, i) => (
            <tr
              key={p.id}
              className={cn(
                'border-b transition-all duration-300',
                visibleRows.includes(i) ? 'opacity-100' : 'opacity-0',
                selectedIdx === i
                  ? 'border-green-700/50 bg-green-950/25'
                  : 'border-defaultBorder/60',
              )}
            >
              <td className="py-2.5 pr-2">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="font-mono text-[10px] text-para">{p.id}</span>
              </td>
              <td className="py-2.5 pr-2">
                <Badge variant="outline" className="border-defaultBorder font-mono text-[10px] text-para">
                  {p.gpu}
                </Badge>
              </td>
              <td className={cn('py-2.5 pr-2 font-mono text-[11px]', selectedIdx === i ? 'font-bold text-green-300' : 'text-green-400')}>
                {revealedBids.includes(i) ? p.bid : (
                  <span className="text-para opacity-40">pending</span>
                )}
              </td>
              <td className="py-2.5">
                {selectedIdx === i
                  ? <span className="rounded-sm bg-green-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-green-400">✓ Selected</span>
                  : <TrustBadge trust={p.trust} />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Step 3: "Deployed successfully" then 0.5s later deployment details
function RunningFrame({ uptime, cost }: { uptime: number; cost: number }) {
  const [successVisible, setSuccessVisible] = useState(true)
  const [detailsVisible, setDetailsVisible] = useState(false)

  useEffect(() => {
    setSuccessVisible(true)
    setDetailsVisible(false)
    const t1 = setTimeout(() => setDetailsVisible(true), 500)   // 0.5s after banner
    const t2 = setTimeout(() => setSuccessVisible(false), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-5 lg:p-8">
      {/* Success banner */}
      <div
        className={cn(
          'mb-4 shrink-0 overflow-hidden rounded-md border border-green-600/50 bg-green-950/60 transition-all duration-700 ease-in-out',
          successVisible ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/30 text-[11px] text-green-400">✓</span>
          <span className="text-sm font-semibold text-green-400">Deployed successfully</span>
          <span className="ml-auto font-mono text-[10px] text-green-400/60">~3s</span>
        </div>
      </div>

      {/* Deployment details — fade in 0.5s after banner */}
      <div className={cn('flex flex-1 flex-col transition-opacity duration-700', detailsVisible ? 'opacity-100' : 'opacity-0')}>

        {/* Template card with llama image */}
        <div className="hidden lg:block mb-3 shrink-0 overflow-hidden rounded-lg border border-defaultBorder bg-card">
          <div className="h-24 w-full overflow-hidden border-b border-defaultBorder">
            <img src="/images/llama-template.webp" alt="Llama 3.1 70B" className="block h-full w-full object-cover" />
          </div>
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-medium text-foreground">llama-3-70b</p>
              <p className="text-[10px] text-para">Llama 3.1 70B · from template</p>
            </div>
            <Badge variant="outline" className="border-green-800 bg-green-950/50 text-green-400">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Running
            </Badge>
          </div>
        </div>

        <div className="mb-2.5 grid shrink-0 grid-cols-2 gap-1.5">
          {[
            { label: 'Provider',    value: 'akash1qj...7f4e' },
            { label: 'Region',      value: 'us-east-2' },
            { label: 'Uptime',      value: fmt(uptime) },
            { label: 'Cost so far', value: `$${cost.toFixed(4)}`, green: true },
          ].map(({ label, value, green }) => (
            <div key={label} className="rounded-md border border-defaultBorder bg-card px-2.5 py-2">
              <p className="mb-0.5 text-[9px] uppercase tracking-wider text-para">{label}</p>
              <p className={cn('font-mono text-[11px]', green ? 'text-green-400' : 'text-foreground')}>{value}</p>
            </div>
          ))}
        </div>

        {[
          { label: 'GPU utilization', detail: '1.88 / 2 units', pct: 94 },
          { label: 'Memory',          detail: '39 / 48 GB',    pct: 81 },
        ].map(({ label, detail, pct }) => (
          <div key={label} className="mb-3 shrink-0">
            <div className="mb-1.5 flex justify-between font-mono text-[10px] text-para">
              <span>{label}</span><span>{detail}</span>
            </div>
            <Progress value={pct} className="h-1 [&>div]:bg-green-500" />
          </div>
        ))}

        <div className="flex shrink-0 items-center justify-between gap-2 rounded-md border border-defaultBorder bg-card px-2.5 py-2">
          <span className="shrink-0 font-mono text-[10px] text-para">Endpoint</span>
          <span className="truncate font-mono text-[10px] text-foreground">
            http://llama-70b.us-east.provider.akash.network:11434
          </span>
        </div>
      </div>
    </div>
  )
}


export function HowItWorks() {
  const [cur, setCur]                       = useState(0)
  const [playing, setPlaying]               = useState(true)
  const [fillPct, setFillPct]               = useState(0)
  const [visibleRows, setVisibleRows]       = useState<number[]>([])
  const [revealedBids, setRevealedBids]     = useState<number[]>([])
  const [selectedProviderIdx, setSelectedProviderIdx] = useState<number | null>(null)
  const [uptime, setUptime]                 = useState(3)
  const [cost, setCost]                     = useState(0.0003)
  const rafRef       = useRef<number | null>(null)
  const startRef     = useRef<number>(performance.now())
  const playingRef   = useRef(true)
  const curRef       = useRef(0)
  const bidTimers    = useRef<ReturnType<typeof setTimeout>[]>([])
  const uptimeTimer  = useRef<ReturnType<typeof setInterval> | null>(null)
  const selectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDragging    = useRef(false)
  const dragStartX    = useRef(0)
  const dragOffsetRef = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const carouselRef   = useRef<HTMLDivElement>(null)

  const clearBidTimers = () => {
    bidTimers.current.forEach(clearTimeout)
    bidTimers.current = []
  }

  const clearSelectTimers = () => {
    if (selectTimer.current)  { clearTimeout(selectTimer.current);  selectTimer.current  = null }
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null }
  }

  const stopRunning = () => {
    if (uptimeTimer.current) clearInterval(uptimeTimer.current)
  }

  const startRunning = () => {
    stopRunning()
    let s = 3; let c = 0.0003
    setUptime(s); setCost(c)
    uptimeTimer.current = setInterval(() => {
      s++; c += 0.000427
      setUptime(s); setCost(c)
    }, 1000)
  }

  // forward-declared so setupFrame can reference it
  const startTimerRef = useRef<() => void>(() => {})
  const setupFrameRef = useRef<(n: number) => void>(() => {})

  const setupFrame = (n: number) => {
    clearBidTimers()
    clearSelectTimers()
    stopRunning()
    setVisibleRows([])
    setRevealedBids([])
    setSelectedProviderIdx(null)

    if (n === 1) {
      PROVIDERS.forEach((p, i) => {
        bidTimers.current.push(
          setTimeout(() => setVisibleRows(prev => [...prev, i]), p.delay),
        )
        bidTimers.current.push(
          setTimeout(() => setRevealedBids(prev => [...prev, i]), p.delay + 700),
        )
      })

      // After last bid revealed (840 + 700 = 1540ms), wait 1s, highlight cheapest provider
      selectTimer.current = setTimeout(() => {
        setSelectedProviderIdx(SELECTED_PROVIDER_IDX)
        // After 1s advance to step 2
        advanceTimer.current = setTimeout(() => {
          if (!playingRef.current) return
          if (rafRef.current) cancelAnimationFrame(rafRef.current)
          const next = 2
          curRef.current = next
          setCur(next)
          setFillPct(0)
          setupFrameRef.current(next)
          startTimerRef.current()
        }, 1000)
      }, 840 + 700 + 1000)
    }

    if (n === 2) startRunning()
  }
  setupFrameRef.current = setupFrame

  const startTimer = () => {
    startRef.current = performance.now()

    const tick = () => {
      if (!playingRef.current) return
      const el = performance.now() - startRef.current
      if (el >= DUR) {
        setFillPct(100)
        setTimeout(() => {
          const next = (curRef.current + 1) % 3
          curRef.current = next
          setCur(next)
          setFillPct(0)
          setupFrame(next)
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
  startTimerRef.current = startTimer

  useEffect(() => {
    setupFrame(0)
    startTimer()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearBidTimers()
      clearSelectTimers()
      stopRunning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      let offset = e.touches[0].clientX - dragStartX.current
      if (curRef.current === 0) offset = Math.min(0, offset)
      if (curRef.current === STEPS.length - 1) offset = Math.max(0, offset)
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
    setupFrame(n)
    if (playingRef.current) startTimer()
  }

  const togglePlay = () => {
    const next = !playing
    setPlaying(next)
    playingRef.current = next
    if (next) {
      if (curRef.current === 1) setupFrameRef.current(1)
      startTimer()
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearBidTimers()
      clearSelectTimers()
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
    if (curRef.current === STEPS.length - 1) offset = Math.max(0, offset)
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
    } else if (offset < -50 && curRef.current < STEPS.length - 1) {
      goTo(curRef.current + 1)
    } else if (playingRef.current) {
      startTimer()
    }
  }

  const progressControls = (
    <div className="flex items-center gap-2">
      <div className="flex h-[28px] items-center gap-2 rounded-md border border-black/10 dark:border-white/15 bg-background px-2.5 dark:bg-card">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i + 1}`}
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
        className="h-[28px] w-[28px] shrink-0 rounded-md border border-black/10 dark:border-white/15 bg-background hover:bg-accent dark:bg-card dark:hover:bg-accent"
      >
        {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </Button>
    </div>
  )

  const progressBar = (
    <div className="mt-6 flex items-center justify-between gap-2">
      {progressControls}
      <a
        href="https://console.akash.network"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:inline-flex h-[28px] items-center gap-1.5 rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent dark:bg-card dark:hover:bg-accent"
      >
        Deploy Now <ChevronRight className="h-3 w-3" />
      </a>
    </div>
  )

  const heading = (
    <div className="mb-10">
      <h2 className="text-[28px] font-semibold leading-tight md:text-[40px]">How It Works</h2>
      <p className="mt-3 max-w-sm text-base text-para md:text-lg">
        Go from configuration to an active workload in seconds.
      </p>
    </div>
  )

  const stepRow = (step: typeof STEPS[0], i: number, withDivider = true) => (
    <div key={i} className="cursor-pointer" onClick={() => goTo(i)}>
      <div className="py-7">
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm transition-all',
            cur === i ? 'border-foreground bg-foreground font-semibold text-background' : 'border-border text-para',
          )}>
            {i + 1}
          </div>
          <p className={cn('text-lg leading-snug transition-colors md:text-xl', cur === i ? 'font-semibold text-foreground' : 'text-para')}>
            {step.title}
          </p>
        </div>
        {cur === i && <p className="mt-2 pl-12 text-sm leading-relaxed text-para">{step.body}</p>}
      </div>
      {withDivider && <div className="h-px bg-border/40" />}
    </div>
  )

  const windowChrome = (
    <div className="flex shrink-0 items-center gap-1.5 border-b border-defaultBorder bg-card px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
    </div>
  )

  return (
    <>
      {/* ── Mobile carousel ── */}
      <div className="flex flex-col lg:hidden">
        {heading}

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
            {STEPS.map((step, i) => (
              <div key={i} className="w-full shrink-0">
                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground bg-foreground text-sm font-semibold text-background">
                      {i + 1}
                    </div>
                    <p className="text-lg font-semibold leading-snug text-foreground">{step.title}</p>
                  </div>
                  <p className="pl-12 text-sm leading-relaxed text-para">{step.body}</p>
                </div>
                <div className="dark flex h-[400px] flex-col overflow-hidden rounded-xl border border-border bg-background">
                  {windowChrome}
                  {cur === i && (
                    <>
                      {i === 0 && <DeployFrame />}
                      {i === 1 && (
                        <ProvidersFrame
                          providers={PROVIDERS_MOBILE_SHORT}
                          visibleRows={PROVIDERS_MOBILE_SHORT.map((_, j) => j)}
                          revealedBids={PROVIDERS_MOBILE_SHORT.map((_, j) => j)}
                          selectedIdx={SELECTED_MOBILE_SHORT_IDX}
                        />
                      )}
                      {i === 2 && <RunningFrame uptime={uptime} cost={cost} />}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="flex h-[28px] items-stretch rounded-md border border-black/10 dark:border-white/15 bg-background px-1 dark:bg-card">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to step ${i + 1}`}
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
        <div className="flex flex-col lg:order-2">
          {heading}
          {STEPS.map((step, i) => stepRow(step, i))}
          {progressBar}
        </div>
        <div
          className="dark flex flex-col overflow-hidden rounded-xl border border-border bg-background lg:order-1"
          style={{ aspectRatio: '1 / 1' }}
        >
          {windowChrome}
          {cur === 0 && <DeployFrame />}
          {cur === 1 && <ProvidersFrame visibleRows={visibleRows} revealedBids={revealedBids} selectedIdx={selectedProviderIdx} />}
          {cur === 2 && <RunningFrame uptime={uptime} cost={cost} />}
        </div>
      </div>
    </>
  )
}
