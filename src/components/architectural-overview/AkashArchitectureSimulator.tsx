import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause } from 'lucide-react'

// ── SVG layout ──────────────────────────────────────────────────────
const VW = 500
const VH = 380
const NW = 88
const NH = 34
const CXS = [56, 153, 250, 347, 444]
const PROV_Y = 28
const PROV_BOT = PROV_Y + NH      // 62
const MKT_Y1 = 148
const MKT_Y2 = 208
const TENT_CX = 250
const TENT_NW = 110
const TENT_Y = 308
const TENT_H = NH
const P_BOT = PROV_BOT + 1        // 63
const M_TOP = MKT_Y1 - 1          // 147
const M_BOT = MKT_Y2 + 1          // 209
const T_TOP = TENT_Y - 1          // 307
const WINNING = 0

// Neutral grays matching shadcn dark palette (hsl 0° = no blue tint)
// --background: hsl(0 0% 4%)  → #0a0a0a
// --card:       hsl(0 0% 9%)  → #171717
// --default-border: hsl(0 0% 18%) → #2e2e2e
// --para:       hsl(0 0% 73%) → #bababa
const CLR_BG   = '#0a0a0a'
const CLR_CARD = '#171717'
const CLR_BORDER = '#2e2e2e'
const CLR_PARA = '#bababa'

// ── Steps ───────────────────────────────────────────────────────────
const STEPS = [
  {
    title: 'SDL Manifest',
    body: 'The tenant defines the container manifest in SDL by specifying the OCI image, hardware resource bounds including GPU model, VRAM minimum, and maximum price.',
  },
  {
    title: 'Open Bidding',
    body: 'The manifest is securely transmitted and broadcast to the Akash as a deployment order. Active providers whose audited hardware satisfies the SDL constraints automatically submit competitive bids in real time.',
  },
  {
    title: 'Active Lease',
    body: 'The tenant accepts the optimized provider bid, locking an automated escrow account funded via standard credit cards into the network settlement module. Funds are drawn down programmatically at the agreed rate.',
  },
]

const DUR = 7000

// ── Providers ───────────────────────────────────────────────────────
const SIM_PROVIDERS = [
  { id: 'akash1…4f2a', gpu: 'RTX 4090 ×1', bid: '$1.18', trust: 'L3', delay: 0 },
  { id: 'akash1…c3d8', gpu: 'RTX 4090 ×1', bid: '$1.31', trust: 'L2', delay: 160 },
  { id: 'akash1…2e1f', gpu: 'RTX 4090 ×1', bid: '$1.23', trust: 'L2', delay: 320 },
  { id: 'akash1…9b7a', gpu: 'RTX 4090 ×1', bid: '$1.67', trust: 'L3', delay: 480 },
  { id: 'akash1…6d5c', gpu: 'RTX 4090 ×1', bid: '$1.45', trust: 'L1', delay: 640 },
]
const SELECTED_IDX = 0

// ── Trust badge ──────────────────────────────────────────────────────
function TrustBadge({ trust }: { trust: string }) {
  return (
    <Badge variant="outline" className={cn(
      'font-mono text-[10px]',
      trust === 'L3' && 'border-green-800 bg-green-950/50 text-green-400',
      trust === 'L2' && 'border-amber-800 bg-amber-950/50 text-amber-400',
      trust === 'L1' && 'border-defaultBorder text-para',
    )}>
      {trust}
    </Badge>
  )
}

// ── SVG topology ─────────────────────────────────────────────────────
type Phase = 0 | 1 | 2

function TopologySVG({ phase }: { phase: Phase }) {
  const showBids  = phase >= 1
  const showLease = phase === 2
  const BID_PRICES = ['$1.18', '$1.31', '$1.23', '$1.67', '$1.45']
  const MKT_COLOR = phase === 0 ? '#22d3ee' : phase === 1 ? '#f59e0b' : '#4ade80'
  const MKT_LABEL = phase === 0 ? 'RECEIVING MANIFEST' : phase === 1 ? '── AUCTION OPEN ──' : 'LEASE ACTIVE'

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`}
      style={{ height: '100%', width: 'auto', maxWidth: '100%', fontFamily: "ui-monospace, 'Cascadia Code', monospace" }}
    >
      <defs>
        <pattern id="as-dots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill={CLR_BORDER} />
        </pattern>
        <filter id="as-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {CXS.map((cx, i) => <path key={`pd${i}`} id={`as-pd-${i}`} d={`M ${cx} ${P_BOT} L ${cx} ${M_TOP}`} />)}
        {CXS.map((cx, i) => <path key={`pu${i}`} id={`as-pu-${i}`} d={`M ${cx} ${M_TOP} L ${cx} ${P_BOT}`} />)}
        <path id="as-tu"    d={`M ${TENT_CX} ${T_TOP} L ${TENT_CX} ${M_BOT}`} />
        <path id="as-lease" d={`M ${CXS[WINNING]} ${P_BOT} L ${CXS[WINNING]} ${M_BOT} L ${TENT_CX} ${M_BOT} L ${TENT_CX} ${T_TOP}`} />
        <style>{`@keyframes as-pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      </defs>

      <rect width={VW} height={VH} fill={CLR_BG} />
      <rect width={VW} height={VH} fill="url(#as-dots)" />

      {CXS.map((cx, i) => (
        <line key={i} x1={cx} y1={P_BOT} x2={cx} y2={M_TOP}
          stroke={showLease ? (i === WINNING ? '#4ade80' : CLR_BORDER) : (showBids ? '#f59e0b44' : CLR_BORDER)}
          strokeWidth={showLease && i === WINNING ? 1.5 : 1}
          strokeDasharray={showLease && i === WINNING ? 'none' : '3 5'}
        />
      ))}
      <line x1={TENT_CX} y1={M_BOT} x2={TENT_CX} y2={T_TOP}
        stroke={showLease ? '#4ade80' : phase === 0 ? '#22d3ee55' : CLR_BORDER}
        strokeWidth={showLease ? 1.5 : 1} strokeDasharray={showLease ? 'none' : '3 5'}
      />
      {showLease && <line x1={CXS[WINNING]} y1={M_BOT} x2={TENT_CX} y2={M_BOT} stroke="#4ade80" strokeWidth="1.5" opacity="0.45" />}

      <rect x="10" y={MKT_Y1} width={VW - 20} height={MKT_Y2 - MKT_Y1}
        rx="4" fill={CLR_BG} stroke={MKT_COLOR} strokeWidth="1"
        style={{ animation: 'as-pulse 2.2s ease-in-out infinite' }} filter="url(#as-glow)"
      />
      <text x={VW / 2} y={MKT_Y1 + (MKT_Y2 - MKT_Y1) / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7.5" fill={MKT_COLOR} fontWeight="600" letterSpacing="1.8"
      >{MKT_LABEL}</text>

      {CXS.map((cx, i) => {
        const isWinner = i === WINNING
        const nodeStroke = showLease ? (isWinner ? '#4ade80' : CLR_BORDER) : (showBids ? '#f59e0b' : CLR_BORDER)
        const labelColor = showLease ? (isWinner ? '#4ade80' : '#5c5c5c') : (showBids ? '#fbbf24' : CLR_PARA)
        return (
          <g key={i}>
            <rect x={cx - NW / 2} y={PROV_Y} width={NW} height={NH} rx="3" fill={CLR_CARD} stroke={nodeStroke} strokeWidth="1" />
            <text x={cx} y={PROV_Y + NH / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill={labelColor} letterSpacing="0.3">
              {`Provider ${String(i + 1).padStart(2, '0')}`}
            </text>
            {showBids && !showLease && (
              <text x={cx} y={PROV_Y - 6} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="#fbbf24" fontWeight="600">
                {BID_PRICES[i]}
              </text>
            )}
            {showLease && isWinner && (
              <text x={cx} y={PROV_Y - 6} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="#4ade80" fontWeight="700">
                ✓ SELECTED
              </text>
            )}
          </g>
        )
      })}

      <rect x={TENT_CX - TENT_NW / 2} y={TENT_Y} width={TENT_NW} height={TENT_H} rx="3" fill={CLR_CARD}
        stroke={phase === 0 ? '#22d3ee' : phase === 2 ? '#4ade80' : CLR_BORDER} strokeWidth="1"
      />
      <text x={TENT_CX} y={TENT_Y + TENT_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" letterSpacing="0.3" fill={phase === 0 ? '#22d3ee' : phase === 2 ? '#4ade80' : CLR_PARA}
      >Tenant — Deployer</text>

      {phase === 0 && (
        <circle r="3" fill="#22d3ee" filter="url(#as-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" calcMode="linear"><mpath href="#as-tu" /></animateMotion>
        </circle>
      )}
      {phase === 1 && CXS.map((_, i) => (
        <circle key={`bc-${i}`} r="2.5" fill="#f59e0b" filter="url(#as-glow)">
          <animateMotion dur={`${1.1 + i * 0.09}s`} repeatCount="indefinite" calcMode="linear"><mpath href={`#as-pu-${i}`} /></animateMotion>
        </circle>
      ))}
      {phase === 1 && CXS.map((_, i) => (
        <circle key={`bid-${i}`} r="2.5" fill="#fbbf24" opacity="0.65" filter="url(#as-glow)">
          <animateMotion dur={`${1.35 + i * 0.11}s`} repeatCount="indefinite" calcMode="linear"><mpath href={`#as-pd-${i}`} /></animateMotion>
        </circle>
      ))}
      {phase === 2 && (
        <>
          <circle r="3" fill="#4ade80" filter="url(#as-glow)">
            <animateMotion dur="2.2s" repeatCount="indefinite" calcMode="linear"><mpath href="#as-lease" /></animateMotion>
          </circle>
          <circle r="3" fill="#4ade80" filter="url(#as-glow)" opacity="0.7">
            <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" calcMode="linear"><mpath href="#as-lease" /></animateMotion>
          </circle>
        </>
      )}
    </svg>
  )
}

// ── Terminal line type ────────────────────────────────────────────────
type TLine = { text: string; cls?: string }

const MANIFEST_LINES: TLine[] = [
  { text: '$ akash tx deployment create manifest.yaml', cls: 'text-para' },
  { text: '' },
  { text: '# manifest.yaml', cls: 'text-para opacity-50' },
  { text: "version: '2.0'",  cls: 'text-foreground' },
  { text: 'services:',       cls: 'text-foreground' },
  { text: '  inference:',    cls: 'text-foreground' },
  { text: '    image: myorg/vllm-server:latest', cls: 'text-green-400' },
  { text: 'profiles:',       cls: 'text-foreground' },
  { text: '  compute:',      cls: 'text-foreground' },
  { text: '    inference:',  cls: 'text-foreground' },
  { text: '      resources:', cls: 'text-foreground' },
  { text: '        gpu: { units: 1 }',        cls: 'text-green-400' },
  { text: '        memory: { size: 16Gi }',   cls: 'text-green-400' },
  { text: '' },
  { text: '→ Validating SDL manifest...',        cls: 'text-sky-400' },
  { text: '→ Broadcasting to on-chain ledger...', cls: 'text-sky-400' },
  { text: '✓ Manifest received by marketplace',   cls: 'text-green-400' },
]

// ── Step 0: Manifest frame ────────────────────────────────────────────
function ManifestFrame() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    setVisibleLines(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setVisibleLines(i)
      if (i >= MANIFEST_LINES.length) clearInterval(id)
    }, 90)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-5">
      <div className="flex-1 font-mono text-[11px] leading-[1.7]">
        {MANIFEST_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={cn(line.cls ?? 'text-para', 'whitespace-pre')}>
            {line.text || ' '}
          </div>
        ))}
        {visibleLines < MANIFEST_LINES.length && (
          <span className="inline-block h-[13px] w-[7px] translate-y-[1px] animate-pulse bg-green-400" />
        )}
      </div>
    </div>
  )
}

// ── Step 1: Auction frame ─────────────────────────────────────────────
function AuctionFrame({
  visibleRows,
  revealedBids,
  selectedIdx,
}: {
  visibleRows: number[]
  revealedBids: number[]
  selectedIdx: number | null
}) {
  const total       = SIM_PROVIDERS.length
  const bidCount    = revealedBids.length
  const allReceived = bidCount === total

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <span className="text-xs font-medium text-foreground">Network providers</span>
        <Badge variant="outline" className="border-green-800 bg-green-950/50 font-mono text-[10px] text-green-400">
          63 online
        </Badge>
      </div>

      <div className={cn(
        'mb-3 flex shrink-0 items-center justify-between rounded-md border px-3 py-2.5 transition-colors duration-500',
        allReceived ? 'border-green-700/60 bg-green-950/40' : 'border-defaultBorder bg-card',
      )}>
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {allReceived
              ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500/25 text-[10px] text-green-400">✓</span>
              : <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            }
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
          <col className="w-[34%]" /><col className="w-[30%]" /><col className="w-[20%]" /><col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-defaultBorder">
            {['Provider', 'GPU', 'Bid / hr', 'Trust'].map((h) => (
              <th key={h} className="pb-1.5 pt-1 text-left text-[9px] font-normal uppercase tracking-wider text-para">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIM_PROVIDERS.map((p, i) => (
            <tr key={p.id} className={cn(
              'border-b transition-all duration-300',
              visibleRows.includes(i) ? 'opacity-100' : 'opacity-0',
              selectedIdx === i ? 'border-green-700/50 bg-green-950/25' : 'border-defaultBorder/60',
            )}>
              <td className="py-2.5 pr-2">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="font-mono text-[10px] text-para">{p.id}</span>
              </td>
              <td className="py-2.5 pr-2">
                <Badge variant="outline" className="border-defaultBorder font-mono text-[10px] text-para">{p.gpu}</Badge>
              </td>
              <td className={cn('py-2.5 pr-2 font-mono text-[11px]', selectedIdx === i ? 'font-bold text-green-300' : 'text-green-400')}>
                {revealedBids.includes(i) ? p.bid : <span className="text-para opacity-40">pending</span>}
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

// ── Step 2: Lease frame ───────────────────────────────────────────────
function LeaseFrame({ uptime, cost }: { uptime: number; cost: number }) {
  const [detailsVisible, setDetailsVisible] = useState(false)

  useEffect(() => {
    setDetailsVisible(false)
    const t = setTimeout(() => setDetailsVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-5">
      {/* Banner — always visible, no collapse */}
      <div className="mb-4 shrink-0 overflow-hidden rounded-md border border-green-600/50 bg-green-950/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/30 text-[11px] text-green-400">✓</span>
          <span className="text-sm font-semibold text-green-400">Lease established</span>
          <span className="ml-auto font-mono text-[10px] text-green-400/60">~2s</span>
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col transition-opacity duration-700', detailsVisible ? 'opacity-100' : 'opacity-0')}>
        <div className="mb-2.5 grid shrink-0 grid-cols-2 gap-1.5">
          {[
            { label: 'Provider',    value: 'akash1…4f2a' },
            { label: 'GPU',         value: 'RTX 4090 ×1' },
            { label: 'Uptime',      value: fmt(uptime) },
            { label: 'Cost so far', value: `$${cost.toFixed(4)}`, green: true },
          ].map(({ label, value, green }) => (
            <div key={label} className="rounded-md border border-defaultBorder bg-card px-2.5 py-2">
              <p className="mb-0.5 text-[9px] uppercase tracking-wider text-para">{label}</p>
              <p className={cn('font-mono text-[11px]', green ? 'text-green-400' : 'text-foreground')}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-2.5 shrink-0 rounded-md border border-defaultBorder bg-card px-2.5 py-2">
          <p className="mb-0.5 text-[9px] uppercase tracking-wider text-para">Escrow locked</p>
          <p className="font-mono text-[11px] text-green-400">$50</p>
        </div>

        {[
          { label: 'GPU utilization', detail: '0.94 / 1 unit', pct: 94 },
          { label: 'Memory',          detail: '14 / 16 GB',    pct: 88 },
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
          <span className="truncate font-mono text-[10px] text-foreground">akash://abc123.akash.pub:8080</span>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
export default function AkashArchitectureSimulator() {
  const [cur, setCur]           = useState(0)
  const [playing, setPlaying]   = useState(true)
  const [fillPct, setFillPct]   = useState(0)
  const [visibleRows, setVisibleRows]   = useState<number[]>([])
  const [revealedBids, setRevealedBids] = useState<number[]>([])
  const [selectedIdx, setSelectedIdx]   = useState<number | null>(null)
  const [uptime, setUptime] = useState(2)
  const [cost, setCost]     = useState(0.0002)

  const rafRef      = useRef<number | null>(null)
  const startRef    = useRef<number>(performance.now())
  const playingRef  = useRef(true)
  const curRef      = useRef(0)
  const bidTimers   = useRef<ReturnType<typeof setTimeout>[]>([])
  const selectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uptimeTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearBidTimers = () => { bidTimers.current.forEach(clearTimeout); bidTimers.current = [] }
  const stopRunning    = () => { if (uptimeTimer.current) clearInterval(uptimeTimer.current) }
  const startRunning   = () => {
    stopRunning()
    let s = 2; let c = 0.0002
    setUptime(s); setCost(c)
    uptimeTimer.current = setInterval(() => { s++; c += 0.000328; setUptime(s); setCost(c) }, 1000)
  }

  const startTimerRef = useRef<() => void>(() => {})
  const setupFrameRef = useRef<(n: number) => void>(() => {})

  const setupFrame = (n: number) => {
    clearBidTimers()
    if (selectTimer.current) { clearTimeout(selectTimer.current); selectTimer.current = null }
    stopRunning()
    setVisibleRows([]); setRevealedBids([]); setSelectedIdx(null)

    if (n === 1) {
      SIM_PROVIDERS.forEach((p, i) => {
        bidTimers.current.push(setTimeout(() => setVisibleRows(prev => [...prev, i]), p.delay))
        bidTimers.current.push(setTimeout(() => setRevealedBids(prev => [...prev, i]), p.delay + 600))
      })
      selectTimer.current = setTimeout(() => setSelectedIdx(SELECTED_IDX), 640 + 600 + 800)
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
          curRef.current = next; setCur(next); setFillPct(0)
          setupFrameRef.current(next)
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
    setupFrame(0); startTimer()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearBidTimers()
      if (selectTimer.current) clearTimeout(selectTimer.current)
      stopRunning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (n: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    curRef.current = n; setCur(n); setFillPct(0)
    setupFrame(n)
    if (playingRef.current) startTimer()
  }

  const togglePlay = () => {
    const next = !playing; setPlaying(next); playingRef.current = next
    if (next) {
      if (curRef.current === 1) setupFrameRef.current(1)
      startTimerRef.current()
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearBidTimers()
      if (selectTimer.current) { clearTimeout(selectTimer.current); selectTimer.current = null }
    }
  }

  return (
    <div>
      {/* Title + progress controls */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Akash Deployment Simulator</h3>
        <div className="flex items-center gap-2">
          <div className="flex h-[28px] items-center gap-2 rounded-md border border-black/10 dark:border-white/15 bg-background px-2.5 dark:bg-card">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Go to step ${i + 1}`}
                className={cn(
                  'relative h-1.5 overflow-hidden rounded-full transition-all duration-300',
                  cur === i ? 'w-16 bg-border/40 dark:bg-defaultBorder' : 'w-1.5 bg-border',
                )}
              >
                {cur === i && (
                  <div className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                    style={{ width: `${fillPct}%`, transition: 'none' }}
                  />
                )}
              </button>
            ))}
          </div>
          <Button onClick={togglePlay} variant="ghost" size="icon" aria-label={playing ? 'Pause' : 'Play'}
            className="h-[28px] w-[28px] shrink-0 rounded-md border border-black/10 dark:border-white/15 bg-background hover:bg-accent dark:bg-card dark:hover:bg-accent"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Outer container — tabs + console as one unit */}
      <div className="overflow-hidden rounded-xl border border-border">

        {/* Step tabs — description text lives inside each active tab */}
        <div className="grid grid-cols-3 border-b border-border">
          {STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'group relative cursor-pointer py-5 text-left transition-colors duration-150',
                i < STEPS.length - 1 ? 'border-r border-border' : '',
                cur === i ? 'bg-background' : 'bg-muted/30 hover:bg-accent dark:bg-muted/10 dark:hover:bg-accent/60',
              )}
            >
              <div className="flex items-start gap-3 px-5">
                <div className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm transition-all duration-150',
                  cur === i
                    ? 'border-foreground bg-foreground font-semibold text-background'
                    : 'border-border text-para group-hover:border-foreground/40 group-hover:text-foreground/60',
                )}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    'text-sm leading-snug transition-colors duration-150 md:text-base',
                    cur === i ? 'font-semibold text-foreground' : 'text-para group-hover:text-foreground/70',
                  )}>
                    {step.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-para">
                    {step.body}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Dark console */}
        <div className="dark flex flex-col bg-background">
          {/* Window chrome */}
          <div className="flex shrink-0 items-center gap-1.5 border-b border-defaultBorder bg-card px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          </div>
          {/* Fixed-height content grid */}
          <div className="grid h-[420px] md:grid-cols-2">
            <div className="h-full overflow-y-auto border-b border-defaultBorder md:border-b-0 md:border-r md:border-defaultBorder">
              {cur === 0 && <ManifestFrame key="mf" />}
              {cur === 1 && <AuctionFrame visibleRows={visibleRows} revealedBids={revealedBids} selectedIdx={selectedIdx} />}
              {cur === 2 && <LeaseFrame key={`lf-${cur}`} uptime={uptime} cost={cost} />}
            </div>
            <div className="flex h-full items-center justify-center overflow-hidden p-3 md:p-5">
              <TopologySVG key={cur} phase={cur as Phase} />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
