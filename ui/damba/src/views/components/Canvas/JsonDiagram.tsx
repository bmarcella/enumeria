/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'
import { CanvasViewport } from './CanvasViewport'
import { useGenericCanvas } from './useGenericCanvas'
import {
  drawEntities,
  entityBounds,
  EntityScene,
  Hit,
  hitTestEntities,
  MenuItem,
  pointerHandlers,
  getBoxMenu,
} from './entityScene'
import { smoothZoomAndPanTo, centerOnBox, fitBox } from './anim'
import { waitForLayout } from './wait'

type Props = {
  initialWidth?: number
  initialHeight?: number
  scene: EntityScene
  animateCenterOnFirst?: boolean
}

// ✅ Keep the exact right-clicked hit in state
type CtxMenuState =
  | { open: true; sx: number; sy: number; items: MenuItem[]; hit: Hit & { kind: 'box' } }
  | { open: false }

export default function JsonDiagram({
  initialWidth = 5000,
  initialHeight = 2500,
  scene,
  animateCenterOnFirst = true,
}: Props) {
  const [menu, setMenu] = useState<CtxMenuState>({ open: false })
  const closeMenu = useCallback(() => setMenu({ open: false }), [])
  const menuRef = useRef<HTMLUListElement | null>(null)

  const OnSelectBox = (id: string | number | null) => {
    if (scene) {
      scene.selectedBoxId = id ?? undefined
      scene.selectedBox = id != null
        ? scene.canvasBoxes.find(b => String(b.id) === String(id))
        : undefined
    }
    api.redraw()
  }

  const { canvasRef, viewportRef, api, scale, mode } =
    useGenericCanvas<EntityScene, Hit>({
      width: initialWidth,
      height: initialHeight,
      draw: drawEntities,
      hitTest: hitTestEntities,
      pointer: {
        ...pointerHandlers(
          /* onDrag */ undefined,
          /* onSelect */ OnSelectBox,
          /* onContext */ (hit, screen) => {
            if (hit?.kind === 'box') {
              const items = getBoxMenu(scene, hit)
              if (items.length) {
                setMenu({ open: true, sx: screen.sx, sy: screen.sy, items, hit }) // 👈 store hit
              }
            }
          }
        ),
      },
      bounds: entityBounds,
    })

   // Close menu on outside click & Esc — but NOT when clicking inside the menu
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!menu.open) return
      const path = e.composedPath?.() ?? []
      // If the click is inside the menu, do nothing
      if (menuRef.current && (path.includes(menuRef.current) || menuRef.current.contains(e.target as Node))) {
        return
      }
      // Otherwise, close it
      closeMenu()
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }

    window.addEventListener('pointerdown', onPointerDown, { capture: true })
    window.addEventListener('keydown', onEsc)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true } as any)
      window.removeEventListener('keydown', onEsc)
    }
  }, [menu.open, closeMenu])

  // Center on first box after layout + first draw
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      api.setScene(scene)
      await waitForLayout(api)
      if (cancelled) return
      await api.awaitNextDraw?.()
      if (cancelled) return

      if (!animateCenterOnFirst || !scene?.canvasBoxes?.length) return
      const b = scene.canvasBoxes[0]
      const rect = { x: b.x ?? 50, y: b.y ?? 50, w: b.width ?? 200, h: b.height ?? 50 }
      centerOnBox(api as any, rect, { scale: 1.15, duration: 420 })
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, animateCenterOnFirst])

  // Fit overlay
  const FitToBox = () => {
    const boxes = scene?.canvasBoxes ?? []
    if (!boxes.length) return
    const minX = Math.min(...boxes.map(b => b.x ?? 0))
    const minY = Math.min(...boxes.map(b => b.y ?? 0))
    const maxX = Math.max(...boxes.map(b => (b.x ?? 0) + (b.width ?? 200)))
    const maxY = Math.max(...boxes.map(b => (b.y ?? 0) + (b.height ?? 50)))
    fitBox(api as any, { x: minX, y: minY, w: maxX - minX, h: maxY - minY }, 40, 420)
  }

  // Cursor reflect mode
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    el.style.cursor = mode === 'dragBox' || mode === 'pan' ? 'grabbing' : 'default'
  }, [mode, viewportRef])

  // ✅ Actually run the menu item with the captured hit
  const runMenuItem = (item: MenuItem) => {
    if (!menu.open) return;
    console.log(item)
    item.onClick({
      scene,
      hit: menu.hit,
      close: () => { closeMenu(); api.redraw() },
      centerOn: (rect) => centerOnBox(api as any, rect, { scale, duration: 240 }),
      fit: () => api.fitToScene?.(40),
    })
    api.redraw()
  }

  if (!viewportRef || !canvasRef) return <h6>Canvas is loading</h6>

  return (
    <div className="relative">
      <div className="row" style={{ marginTop: '1%', marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="col">
          <CanvasViewport
            viewportRef={viewportRef}
            canvasRef={canvasRef}
            overlay={
              <div className="flex items-center gap-2 rounded bg-white/90 shadow px-2 py-1 text-xs" style={{ userSelect: 'none' }}>
                <span>Zoom {scale.toFixed(2)}x</span>
                <span>{mode === 'dragBox' ? 'Dragging' : mode === 'pan' ? 'Panning' : 'Idle'}</span>

                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => {
                    const st = api.engine.current?.getState()
                    if (!st) return
                    const targetScale = st.scale * 1.1
                    const worldCenterX = st.width / (2 * st.scale) - st.panX / st.scale
                    const worldCenterY = st.height / (2 * st.scale) - st.panY / st.scale
                    smoothZoomAndPanTo(api as any, targetScale, worldCenterX, worldCenterY, 240)
                  }}
                >
                  +
                </button>

                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => {
                    const st = api.engine.current?.getState()
                    if (!st) return
                    const targetScale = st.scale / 1.1
                    const worldCenterX = st.width / (2 * st.scale) - st.panX / st.scale
                    const worldCenterY = st.height / (2 * st.scale) - st.panY / st.scale
                    smoothZoomAndPanTo(api as any, targetScale, worldCenterX, worldCenterY, 240)
                  }}
                >
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
      </div>
      {/* Context menu */}
      {menu.open && (
        <ul
          className="fixed z-50 min-w-[180px] bg-white shadow-lg rounded border py-1 text-sm"
          ref={menuRef}
          style={{ left: menu.sx, top: menu.sy }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {menu.items.map((mi) => (
            <li key={mi.id}>
              <button
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${mi.danger ? 'text-red-600' : ''}`}
                onClick={() => runMenuItem(mi)}  // 👈 now runs the action with the right hit
              >
                <span>{mi.label}</span>
                {mi.shortcut && <span className="float-right opacity-50">{mi.shortcut}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
