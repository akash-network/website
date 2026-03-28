'use client'

import { useEffect, useRef, useState } from 'react'
import { type Provider } from './types.ts'

interface GlobeProps {
  providers: Provider[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function projectPoint(
  lat: number,
  lng: number,
  phi: number,
  theta: number
): { x: number; y: number; visible: boolean } {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180

  const px = Math.cos(latRad) * Math.cos(lngRad)
  const py = Math.sin(latRad)
  const pz = -Math.cos(latRad) * Math.sin(lngRad)

  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  const x1 = px * cosPhi + pz * sinPhi
  const pz1 = -px * sinPhi + pz * cosPhi

  const cosT = Math.cos(theta)
  const sinT = Math.sin(theta)
  const y2 = py * cosT - pz1 * sinT
  const pz2 = py * sinT + pz1 * cosT

  return {
    x: 0.5 + x1 * 0.48,
    y: 0.5 - y2 * 0.48,
    visible: pz2 > 0,
  }
}

export default function Globe({ providers, selectedId, onSelect }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(-1.76)
  const thetaRef = useRef(0.26)
  const targetPhi = useRef(-1.76)
  const targetTheta = useRef(0.26)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  // const [isDark, setIsDark] = useState(true)

  // useEffect(() => {
  //   const checkTheme = () => {
  //     setIsDark(document.documentElement.classList.contains('dark'))
  //   }
    
  //   checkTheme()
  //   const observer = new MutationObserver(checkTheme)
  //   observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  //   return () => observer.disconnect()
  // }, [])

  useEffect(() => {
    if (!selectedId) return
    const provider = providers.find((p) => p.id === selectedId)
    if (!provider) return
    targetPhi.current = -((provider.lng + 90) * Math.PI) / 180
    targetTheta.current = (provider.lat * Math.PI) / 180 * 0.25
  }, [selectedId, providers])

  useEffect(() => {
    let globe: any
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const size = container.clientWidth

    const init = async () => {
      const { default: createGlobe } = await import('cobe')

      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: size * 2,
        height: size * 2,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: 0.8,
        diffuse: 0,
        mapSamples: 50000,
        mapBrightness: 1.5,
        mapBaseBrightness: 0,
        baseColor: [0.3, 0.3, 0.3],
        markerColor: [1, 1, 1],
        glowColor: [0, 0, 0],
        markers: [],
        scale: 1.2,
      })

      let rafId: number
      const animate = () => {
        if (!dragging.current) {
          
          targetPhi.current += 0.001
          
          const ease = 0.08
          phiRef.current += (targetPhi.current - phiRef.current) * ease
          thetaRef.current += (targetTheta.current - thetaRef.current) * ease
        }
        
        thetaRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, thetaRef.current))

        globe.update({
          phi: phiRef.current,
          theta: thetaRef.current,
        })

        providers.forEach((p) => {
          const pos = projectPoint(p.lat, p.lng, phiRef.current, thetaRef.current)
          container.style.setProperty(`--cobe-x-${p.id}`, `${pos.x * 100}%`)
          container.style.setProperty(`--cobe-y-${p.id}`, `${pos.y * 100}%`)
          container.style.setProperty(`--cobe-visible-${p.id}`, pos.visible ? '1' : '0')
        })

        rafId = requestAnimationFrame(animate)
      }
      
      rafId = requestAnimationFrame(animate)
      return () => {
        cancelAnimationFrame(rafId)
        if (globe) globe.destroy()
      }
    }

    const cleanupPromise = init()

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-pin]')) return
      dragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
      container.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      phiRef.current += dx * 0.005
      thetaRef.current += dy * 0.005
      targetPhi.current = phiRef.current
      targetTheta.current = thetaRef.current
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => {
      dragging.current = false
      container.style.cursor = 'grab'
    }

    container.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup())
      container.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [providers])
  // }, [providers, isDark])

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full cursor-grab select-none overflow-visible"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-100"
        style={{ contain: 'layout paint size' }}
      />

      {providers.map((p) => {
        const isSelected = p.id === selectedId
        const isHovered = p.id === hoveredId
        const showLabel = isSelected || isHovered

        return (
          <div
            key={p.id}
            data-pin
            className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center p-4 ${
              showLabel ? 'z-[100]' : 'z-10'
            }`}
            style={{
              left: `var(--cobe-x-${p.id})`,
              top: `var(--cobe-y-${p.id})`,
              opacity: `var(--cobe-visible-${p.id})`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <button
                data-pin
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(p.id)
                }}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="p-3 pointer-events-auto cursor-pointer rounded-full group"
              >
                <span
                  className={`block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[#FF2903] scale-150 ring-1 ring-white shadow-[0_0_12px_rgba(255,41,3,0.8)]' 
                      : 'bg-white'
                  } ${
                    isHovered && !isSelected ? 'scale-125 ring-1 ring-white/40 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''
                  }`}
                />
              </button>

              {showLabel && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-[#212124] px-3 py-1.5 rounded-sm flex items-center gap-2 whitespace-nowrap">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#FF2903]' : 'bg-white'}`} />
                    <span className="text-[12px] text-white font-medium">
                      {p.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}