import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Lock, MapPin, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const PROBLEMS = [
  {
    Icon: FileText,
    title: 'Pricing Opacity',
    body: 'Rates set by internal revenue teams. No market competition. No public bid history.',
    text: 'text-red-400',
    border: 'border-red-900/50',
    bg: 'bg-red-950/20',
  },
  {
    Icon: MapPin,
    title: 'Regional Concentration',
    body: 'Fixed datacenter footprint. Hardware availability tied to one entity\'s roadmap.',
    text: 'text-amber-400',
    border: 'border-amber-900/50',
    bg: 'bg-amber-950/20',
  },
  {
    Icon: Lock,
    title: 'Contractual Lock-in',
    body: 'Reserved discounts engineered to increase switching costs over time.',
    text: 'text-orange-400',
    border: 'border-orange-900/50',
    bg: 'bg-orange-950/20',
  },
]

export function HyperscaleIsolationDiagram() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1200),
      setTimeout(() => setStep(4), 1600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="dark flex flex-col overflow-hidden rounded-xl border border-border bg-background"
      style={{ aspectRatio: '1 / 1' }}
    >
      <div className="flex shrink-0 items-center gap-1.5 border-b border-defaultBorder bg-card px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[10px] text-para">centralized-cloud.model</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 lg:p-7">

        {/* Central vendor node */}
        <div className={cn(
          'rounded-lg border border-defaultBorder bg-card p-4 text-center transition-all duration-500',
          step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
        )}>
          <p className="mb-1 text-[9px] uppercase tracking-widest text-para">Single Vendor Control Point</p>
          <p className="text-sm font-semibold text-foreground">Legacy Hyperscaler</p>
          <div className="mt-2.5 flex justify-center gap-1.5">
            <Badge variant="outline" className="border-defaultBorder px-2 py-0 text-[9px] text-para">AWS</Badge>
            <Badge variant="outline" className="border-defaultBorder px-2 py-0 text-[9px] text-para">Azure</Badge>
            <Badge variant="outline" className="border-defaultBorder px-2 py-0 text-[9px] text-para">GCP</Badge>
          </div>
        </div>

        {/* Branching SVG connector */}
        <div className={cn('shrink-0 transition-opacity duration-300', step >= 1 ? 'opacity-40' : 'opacity-0')}>
          <svg viewBox="0 0 300 28" className="w-full" preserveAspectRatio="none">
            <line x1="150" y1="0" x2="150" y2="14" stroke="hsl(var(--border))" strokeWidth="1" />
            <line x1="50" y1="14" x2="250" y2="14" stroke="hsl(var(--border))" strokeWidth="1" />
            <line x1="50" y1="14" x2="50" y2="28" stroke="hsl(var(--border))" strokeWidth="1" />
            <line x1="150" y1="14" x2="150" y2="28" stroke="hsl(var(--border))" strokeWidth="1" />
            <line x1="250" y1="14" x2="250" y2="28" stroke="hsl(var(--border))" strokeWidth="1" />
          </svg>
        </div>

        {/* Three problem cards */}
        <div className="grid flex-1 grid-cols-3 gap-2">
          {PROBLEMS.map((p, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col gap-2 rounded-lg border p-3 transition-all duration-500',
                p.border, p.bg,
                step >= i + 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
              )}
            >
              <p.Icon className={cn('h-3.5 w-3.5 shrink-0', p.text)} />
              <p className={cn('text-[10px] font-semibold leading-snug', p.text)}>{p.title}</p>
              <p className="text-[9px] leading-relaxed text-para">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Status footer */}
        <div className={cn(
          'shrink-0 flex items-center gap-2 rounded-md border border-defaultBorder bg-card/50 px-3 py-2 transition-opacity duration-500',
          step >= 4 ? 'opacity-100' : 'opacity-0',
        )}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <span className="font-mono text-[10px] text-para">No competitive market. No exit path.</span>
        </div>

      </div>
    </div>
  )
}
