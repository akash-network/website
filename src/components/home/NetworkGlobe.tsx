import createGlobe from 'cobe'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Types ──────────────────────────────────────────────────────────────────

export interface InitialStats {
  activeLeaseCount:    number
  activeProviderCount: number
  totalCPU:     number
  totalGPU:     number
  totalMemory:  number
  totalStorage: number
}

interface StatItem { value: string; label: string }

// ── Formatters ─────────────────────────────────────────────────────────────

function fmtNum(n: number) { return n.toLocaleString('en-US') }

function fmtBytes(bytes: number): string {
  const PB = 1024 ** 5
  const TB = 1024 ** 4
  if (bytes >= PB) return `${(bytes / PB).toFixed(1)} PB`
  return `${Math.round(bytes / TB)} TB`
}

function fmtCPU(millicores: number): string {
  const cores = millicores / 1_000
  if (cores >= 1_000_000) return `${(cores / 1_000_000).toFixed(1)}M`
  if (cores >= 1_000)     return `${Math.round(cores / 1_000)}k`
  return fmtNum(Math.round(cores))
}

function buildStats(s: InitialStats): StatItem[] {
  return [
    { value: fmtNum(s.activeProviderCount), label: 'Active Providers' },
    { value: fmtCPU(s.totalCPU),            label: 'vCPUs' },
    { value: fmtNum(s.totalGPU),            label: 'GPUs' },
    { value: fmtBytes(s.totalMemory),       label: 'Memory' },
    { value: fmtBytes(s.totalStorage),      label: 'Storage' },
  ]
}

// ── Globe constants ────────────────────────────────────────────────────────

const CANVAS_PX = 520
const THETA     = 0.20

const FALLBACK_MARKERS: [number, number][] = [
  [37.4316, -78.6569],
  [50.1109,  8.6821],
  [35.6762, 139.6503],
  [1.3521,  103.8198],
  [-23.5505, -46.6333],
]

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  initialStats:   InitialStats | null
  initialMarkers: [number, number][]
}

export function NetworkGlobe({ initialStats, initialMarkers }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef    = useRef(-0.6)
  const dragging  = useRef(false)
  const lastX     = useRef(0)
  const rafRef    = useRef<number>(0)

  const [grabbing, setGrabbing] = useState(false)

  const stats: StatItem[] | null = initialStats ? buildStats(initialStats) : null
  const markers = initialMarkers.length > 0 ? initialMarkers : FALLBACK_MARKERS

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getIsDark = () => document.documentElement.classList.contains('dark')

    const themeConfig = (dark: boolean) => ({
      dark:          dark ? 1 : 0,
      mapBrightness: dark ? 2.5 : 6,
      baseColor:     (dark ? [0.3, 0.3, 0.3] : [0.85, 0.85, 0.85]) as [number, number, number],
      glowColor:     (dark ? [0.07, 0.07, 0.07] : [1, 1, 1]) as [number, number, number],
    })

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width:  CANVAS_PX,
      height: CANVAS_PX,
      phi:   phiRef.current,
      theta: THETA,
      diffuse:     1.2,
      mapSamples:  32000,
      markerColor: [1.0, 0.255, 0.298],
      ...themeConfig(getIsDark()),
      markers: markers.map(loc => ({ location: loc, size: 0.030 })),
    })

    const themeObserver = new MutationObserver(() => {
      globe.update(themeConfig(getIsDark()))
    })
    themeObserver.observe(document.documentElement, {
      attributes:      true,
      attributeFilter: ['class'],
    })

    function animate() {
      if (!dragging.current) phiRef.current += 0.003
      globe.update({ phi: phiRef.current, theta: THETA })
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globe.destroy()
      themeObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    lastX.current    = e.clientX
    setGrabbing(true)
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const displayed = (e.currentTarget as HTMLDivElement).offsetWidth || CANVAS_PX
    const sensitivity = 0.005 * (CANVAS_PX / displayed)
    phiRef.current += (e.clientX - lastX.current) * sensitivity
    lastX.current   = e.clientX
  }
  const onPointerUp = () => { dragging.current = false; setGrabbing(false) }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-8 mb-6">
        <div>
          <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
            Global Grid. No Off Switch.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-para">
            Access a global network engineered for high availability. While centralized clouds
            rely on single points of failure, Akash uses a distributed protocol to keep your
            workloads independent and resilient against system-wide failure.
          </p>
        </div>
        <div className="hidden md:flex gap-2 shrink-0">
          <Button asChild size="sm"
            className="h-9 gap-1.5 border border-border bg-transparent text-foreground hover:bg-accent">
            <a href="/ecosystem/providers">
              View All Providers <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button asChild size="sm"
            className="h-9 gap-1.5 bg-foreground text-background hover:bg-foreground/90 border-0">
            <a href="https://provider-console.akash.network/" target="_blank" rel="noopener noreferrer">
              Become a Provider <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Live stats — hidden if API unavailable */}
      {stats && (
        <div className="border-t border-border py-6 grid grid-cols-3 sm:grid-cols-5 gap-y-6">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-xl font-semibold text-foreground sm:text-2xl tabular-nums">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-para">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="md:hidden mb-4">
        <Button asChild size="sm"
          className="w-full h-9 gap-1.5 border border-border bg-transparent text-foreground hover:bg-accent">
          <a href="/ecosystem/providers">
            View All Providers <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>

      {/* Globe */}
      <div
        className="relative mt-2 rounded-2xl border border-border bg-zinc-100 dark:bg-black overflow-hidden flex items-center justify-center py-8"
      >
        <div
          className="relative select-none"
          style={{
            width: CANVAS_PX,
            maxWidth: '100%',
            aspectRatio: '1 / 1',
            cursor: grabbing ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
          />
        </div>

      </div>
    </div>
  )
}
