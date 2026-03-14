/* eslint-disable @typescript-eslint/no-explicit-any */
// canvas/anim.ts
type ApiLike = {
  setPan: (x: number, y: number) => void
  setScale: (s: number) => void
  getScale: () => number
  engine: { current: { getState: () => any } | null }
}

export type EasingFn = (t: number) => number
export const easeInOutCubic: EasingFn = t =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

/**
 * Animate to a target world point (wx, wy) with a target scale.
 * Keeps the target world point under the same screen position
 * during the animation (feels natural).
 */
export function smoothZoomAndPanTo(
  api: ApiLike,
  targetScale: number,
  wx: number,
  wy: number,
  duration = 480,
  easing: EasingFn = easeInOutCubic
) {
  const st = api.engine.current?.getState()
  if (!st) return

  const startScale = st.scale
  const vpW = st.width
  const vpH = st.height

  // choose the screen point that should stay “anchored” to (wx, wy)
  const anchorX = vpW / 2
  const anchorY = vpH / 2

  // helper to compute pan that places world (wx, wy) under (sx, sy) at scale s
  const panFor = (s: number, worldX: number, worldY: number, screenX: number, screenY: number) => ({
    x: screenX - worldX * s,
    y: screenY - worldY * s,
  })


  const start = performance.now()
  function frame(now: number) {
    const t = Math.min(1, (now - start) / duration)
    const k = easing(t)
    const s = lerp(startScale, targetScale, k)

    // intermediate pan that keeps the anchor pinned
    const p = panFor(s, wx, wy, anchorX, anchorY)

    api.setScale(s)
    api.setPan(p.x, p.y)

    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

/** Animate a smooth pan (no zoom). */
export function smoothPanTo(
  api: ApiLike,
  toX: number,
  toY: number,
  duration = 420,
  easing: EasingFn = easeInOutCubic
) {
  const st = api.engine.current?.getState()
  if (!st) return
  const fromX = st.panX, fromY = st.panY
  const start = performance.now()
  function frame(now: number) {
    const t = Math.min(1, (now - start) / duration)
    const k = easing(t)
    api.setPan(lerp(fromX, toX, k), lerp(fromY, toY, k))
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

/**
 * Helper: center on a box (x,y,w,h) with optional target scale.
 * If no scale given, keeps current zoom.
 */
export function centerOnBox(
  api: ApiLike,
  box: { x: number; y: number; w: number; h: number },
  opts: { scale?: number; duration?: number; easing?: EasingFn } = {}
) {
  const st = api.engine.current?.getState()
  if (!st) return
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const targetScale = opts.scale ?? st.scale
  smoothZoomAndPanTo(api, targetScale, cx, cy, opts.duration ?? 420, opts.easing ?? easeInOutCubic)
}

/**
 * Helper: fit a box into the viewport with padding (animated).
 */
export function fitBox(
  api: ApiLike,
  box: { x: number; y: number; w: number; h: number },
  pad = 40,
  duration = 480,
  easing: EasingFn = easeInOutCubic
) {
  const st = api.engine.current?.getState()
  if (!st) return
  const vpW = st.width - pad * 2
  const vpH = st.height - pad * 2
  const sx = vpW / Math.max(box.w, 1)
  const sy = vpH / Math.max(box.h, 1)
  const targetScale = Math.min(st.maxZoom ?? 5, Math.max(st.minZoom ?? 0.1, Math.min(sx, sy)))

  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  smoothZoomAndPanTo(api, targetScale, cx, cy, duration, easing)
}
