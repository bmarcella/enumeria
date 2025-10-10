// useGenericCanvas.ts
import { useEffect, useMemo, useRef, useState } from 'react'
import { EngineOptions, GenericCanvasEngine, GenericCanvasState, InteractionMode } from './GenericCanvasEngine'

export function useGenericCanvas<TScene = unknown, THit = unknown>(opts: EngineOptions<TScene, THit>) {
  const engineRef = useRef<GenericCanvasEngine<TScene, THit> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const [scale, setScale] = useState(1)
  const [mode, setMode] = useState<InteractionMode>('idle')   // ⬅️

  useEffect(() => {
    if (!canvasRef.current || !viewportRef.current) return

    const engine = new GenericCanvasEngine<TScene, THit>(opts)
    engineRef.current = engine
    engine.attach(canvasRef.current, viewportRef.current)

    // 🔊 listen for engine state changes (wheel/pan/resize/etc.)
    const onState = (e: Event) => {
      const detail = (e as CustomEvent).detail as GenericCanvasState;
      if (typeof detail?.scale === 'number') setScale(detail.scale)
      if (detail?.mode) setMode(detail.mode)  
    }

    canvasRef.current.addEventListener('engine:state', onState as EventListener)

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        // IMPORTANT: keep engine size in sync with the viewport
        engineRef.current?.resize(Math.max(200, Math.floor(width)), Math.max(200, Math.floor(height)))
      }
    })

    ro.observe(viewportRef.current)

    return () => {
      ro.disconnect()
      engine.detach()
      engineRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const api = useMemo(() => ({
    setScene: (scene: TScene | null) => engineRef.current?.setScene(scene),
    setScale: (s: number) => { engineRef.current?.setScale(s); setScale(engineRef.current?.getScale() ?? s) },
    getScale: () => engineRef.current?.getScale() ?? 1,
    setPan: (x: number, y: number) => engineRef.current?.setPan(x, y),
    fitToScene: (pad?: number) => engineRef.current?.fitToScene(pad),
    setOptions: (o: Partial<EngineOptions<TScene, THit>>) => engineRef.current?.setOptions(o as any),
    redraw: () => engineRef.current?.requestRedraw(),
    awaitNextDraw: () => engineRef.current?.awaitNextDraw() ?? Promise.resolve(),
    engine: engineRef,
  }), [])

  return { canvasRef, viewportRef, scale, api, mode }
}
