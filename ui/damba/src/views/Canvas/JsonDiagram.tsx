/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { CanvasViewport } from './CanvasViewport'
import { useGenericCanvas } from './useGenericCanvas'
import {
  drawEntities, entityBounds, EntityScene, Hit,
  hitTestEntities, MenuItem, pointerHandlers,
} from './entityScene'
import { smoothZoomAndPanTo, centerOnBox, fitBox } from './anim'
import { waitForLayout } from './wait'   // ⬅️ add this

type Props = {
  initialWidth?: number
  initialHeight?: number
  scene: EntityScene
  animateCenterOnFirst?: boolean
}

type CtxMenuState =
  | { open: true; sx: number; sy: number; items: MenuItem[] }
  | { open: false }


export default function JsonDiagram({
  initialWidth = 5000,
  initialHeight = 2500,
  scene,
  animateCenterOnFirst = true,
}: Props) {

  const pointer = useMemo(
    () => pointerHandlers(
      /* onDrag */ undefined,
      /* onSelect */(id) => { if (scene) { scene.selectedBoxId = id ?? undefined }; api.redraw() },
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene]
  )

  const [menu, setMenu] = useState<CtxMenuState>({ open: false })

  const { canvasRef, viewportRef, api, scale, mode } =
    useGenericCanvas<EntityScene, Hit>({
      width: initialWidth,
      height: initialHeight,
      draw: drawEntities,
      hitTest: hitTestEntities,
      pointer,
      bounds: entityBounds,
    })

  useEffect(() => {
    let cancelled = false;
    (async () => {
      api.setScene(scene)

      // 1) wait for viewport size to propagate to engine
      await waitForLayout(api)
      if (cancelled) return

      // 2) wait for the FIRST draw to finish (so boxes may have x/y/wh set)
      await api.awaitNextDraw()
      if (cancelled) return

      if (!animateCenterOnFirst || !scene?.canvasBoxes?.length) return
      const b = scene.canvasBoxes[0]
      const rect = {
        x: b.x ?? 50,
        y: b.y ?? 50,
        w: (b.width ?? 200),
        h: (b.height ?? 50),
      }
      centerOnBox(api as any, rect, { scale: 1.15, duration: 420 })
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, animateCenterOnFirst])

  const FitToBox = () => {
    const boxes = scene?.canvasBoxes ?? []
    if (!boxes.length) return
    const minX = Math.min(...boxes.map(b => b.x ?? 0))
    const minY = Math.min(...boxes.map(b => b.y ?? 0))
    const maxX = Math.max(...boxes.map(b => (b.x ?? 0) + (b.width ?? 200)))
    const maxY = Math.max(...boxes.map(b => (b.y ?? 0) + (b.height ?? 50)))
    fitBox(api as any, { x: minX, y: minY, w: maxX - minX, h: maxY - minY }, 40, 420)
  };

  useEffect(() => {
  const el = viewportRef.current
  if (!el) return
  el.style.cursor = mode === 'dragBox' || mode === 'pan' ? 'grabbing' : 'default'
}, [mode, viewportRef])


  if (!viewportRef || !canvasRef) return <><h6>Canvas is loading</h6></>
  return (
    <div className="row" style={{ marginTop: "1%", marginLeft: "auto", marginRight: "auto" }}>
      <div className="col">
        <CanvasViewport
          viewportRef={viewportRef}
          canvasRef={canvasRef}
          overlay={
            <div className="flex items-center gap-2 rounded bg-white/90 shadow px-2 py-1 text-xs"
              style={{ userSelect: 'none' }}>
              <span>Zoom {scale.toFixed(2)}x</span>
               <span>
                 {mode === 'dragBox' ? 'Dragging' : mode === 'pan' ? 'Panning' : 'Idle'}
              </span>
              <button className="px-2 py-1 border rounded"
                onClick={() => {
                  const st = api.engine.current?.getState()
                  if (!st) return
                  const targetScale = st.scale * 1.1
                  const worldCenterX = st.width / (2 * st.scale) - st.panX / st.scale
                  const worldCenterY = st.height / (2 * st.scale) - st.panY / st.scale
                  smoothZoomAndPanTo(api as any, targetScale, worldCenterX, worldCenterY, 240)
                }}>
                +
              </button>
              <button className="px-2 py-1 border rounded"
                onClick={() => {
                  const st = api.engine.current?.getState()
                  if (!st) return
                  const targetScale = st.scale / 1.1
                  const worldCenterX = st.width / (2 * st.scale) - st.panX / st.scale
                  const worldCenterY = st.height / (2 * st.scale) - st.panY / st.scale
                  smoothZoomAndPanTo(api as any, targetScale, worldCenterY, worldCenterY, 240)
                }}>
                –
              </button>
              <button className="px-2 py-1 border rounded" onClick={FitToBox}>
                Fit
              </button>
            </div>
          }
          overlayStyle={{ top: 8, right: 8 }}
          ariaLabel="Entity diagram"
        />
      </div>
    </div >
  )
}
