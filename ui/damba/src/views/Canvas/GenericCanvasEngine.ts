/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type InteractionMode = 'idle' | 'dragBox' | 'pan'
export interface GenericCanvasState {
  scale: number,
  panX: number,
  panY: number,
  width: number,
  height: number,
  mode: InteractionMode
}
export type EngineState<TScene> = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  viewport: HTMLElement
  width: number
  height: number
  scale: number
  panX: number
  panY: number
  scene: TScene | null
  toWorld: (sx: number, sy: number) => { x: number; y: number }
  withTransform: <R>(fn: () => R) => R
}

export type DrawCallbacks<TScene> = {
  drawBackground?: (state: Omit<EngineState<TScene>, 'withTransform' | 'toWorld'>) => void
  drawScene?: (state: EngineState<TScene>) => void
  drawOverlay?: (state: EngineState<TScene>) => void
  drawHud?: (state: Omit<EngineState<TScene>, 'withTransform' | 'toWorld'>) => void
}

export type HitTest<TScene, THit> = (
  worldX: number,
  worldY: number,
  state: EngineState<TScene>
) => THit | null

export type PointerHandlers<TScene, THit> = {
  onWheel?: (delta: number, state: EngineState<TScene>) => boolean | void
  onPointerDown?: (e: PointerEvent, hit: THit | null, state: EngineState<TScene>) => boolean | void
  onPointerMove?: (
    e: PointerEvent,
    drag: { dx: number; dy: number } | null,
    hit: THit | null,
    state: EngineState<TScene>
  ) => boolean | void
  onPointerUp?: (e: PointerEvent, hit: THit | null, state: EngineState<TScene>) => boolean | void
  onClick?: (e: MouseEvent, hit: THit | null, state: EngineState<TScene>) => boolean | void
  onDblClick?: (e: MouseEvent, hit: THit | null, state: EngineState<TScene>) => boolean | void
  onPanStart?: (state: EngineState<TScene>) => void
  onPan?: (state: EngineState<TScene>) => void
  onPanEnd?: (state: EngineState<TScene>) => void
  onContextMenu?: (
    e: MouseEvent,
    hit: THit | null,
    state: EngineState<TScene>,
    screen: { sx: number; sy: number },
    world: { x: number; y: number }
  ) => boolean | void
}

export type BoundsAdapter<TScene> = (scene: TScene) =>
  | { minX: number; minY: number; maxX: number; maxY: number }
  | null

export type EngineOptions<TScene, THit> = {
  width: number
  height: number
  minZoom?: number
  maxZoom?: number
  stepZoom?: number
  draw?: DrawCallbacks<TScene>
  hitTest?: HitTest<TScene, THit>
  pointer?: PointerHandlers<TScene, THit>
  bounds?: BoundsAdapter<TScene>
  suppressContextMenu?: boolean
}

export class GenericCanvasEngine<TScene = unknown, THit = unknown> {
  private nextDrawResolvers: Array<() => void> = []
  private canvas: HTMLCanvasElement | null = null
  private viewport: HTMLElement | null = null

  private width: number
  private height: number

  private scale = 1
  private panX = 0
  private panY = 0
  private minZoom: number
  private maxZoom: number
  private stepZoom: number

  private scene: TScene | null = null
  private draw?: DrawCallbacks<TScene>
  private hitTest?: HitTest<TScene, THit>
  private pointer?: PointerHandlers<TScene, THit>
  private bounds?: BoundsAdapter<TScene>
  private suppressContextMenu: boolean

  /** Interaction config */
  private moveThreshold = 3 // pixels in world coords before starting drag/pan

  /** Pointer state */
  private isPrimaryDown = false
  private downWorld: { x: number; y: number } | null = null
  private lastWorld: { x: number; y: number } | null = null
  private downHit: THit | null = null

  /** Current mode after threshold crossed */
  private mode: InteractionMode = 'idle'
  private panStartX = 0
  private panStartY = 0

  /** Redraw throttle */
  private dirty = false

  constructor(opts: EngineOptions<TScene, THit>) {
    this.width = Math.max(200, Math.floor(opts.width))
    this.height = Math.max(200, Math.floor(opts.height))
    this.minZoom = opts.minZoom ?? 0.1
    this.maxZoom = opts.maxZoom ?? 5
    this.stepZoom = opts.stepZoom ?? 0.1
    this.draw = opts.draw
    this.hitTest = opts.hitTest
    this.pointer = opts.pointer
    this.bounds = opts.bounds
    this.suppressContextMenu = opts.suppressContextMenu ?? true
  }

  /* ------------------------------- life -------------------------------- */

  attach(canvas: HTMLCanvasElement, viewport: HTMLElement) {
    this.canvas = canvas
    this.viewport = viewport
    this.resize(this.width, this.height)
    this.bind()
    this.drawFrame()
  }
  detach() {
    this.unbind()
    this.canvas = null
    this.viewport = null
  }

  setOptions(opts: Partial<Pick<EngineOptions<TScene, THit>,
    'draw' | 'hitTest' | 'pointer' | 'minZoom' | 'maxZoom' | 'stepZoom' | 'bounds'>>) {
    if (opts.draw !== undefined) this.draw = opts.draw
    if (opts.hitTest !== undefined) this.hitTest = opts.hitTest
    if (opts.pointer !== undefined) this.pointer = opts.pointer
    if (opts.bounds !== undefined) this.bounds = opts.bounds
    if (opts.minZoom !== undefined) this.minZoom = opts.minZoom
    if (opts.maxZoom !== undefined) this.maxZoom = opts.maxZoom
    if (opts.stepZoom !== undefined) this.stepZoom = opts.stepZoom
    this.requestRedraw()
  }

  getState(): EngineState<TScene> {
    const ctx = this.canvas?.getContext('2d')!
    return this.sceneState(ctx)
  }

  /* ------------------------------- scene / view ------------------------ */

  setScene(scene: TScene | null) { this.scene = scene; this.requestRedraw() }

  private notifyState() {
    if (!this.canvas) return
    this.canvas.dispatchEvent(new CustomEvent('engine:state', {
      detail: {
        scale: this.scale,
        panX: this.panX,
        panY: this.panY,
        width: this.width,
        height: this.height,
        mode: this.mode,
      } as GenericCanvasState
    }))
  }


  setScale(s: number) {
    this.scale = Math.min(this.maxZoom, Math.max(this.minZoom, s))
    this.notifyState()
    this.requestRedraw()
  }
  getScale() { return this.scale }

  setScaleAtCursor(nextScale: number, sx: number, sy: number) {
  const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, nextScale))
  const prev = this.scale
  if (clamped === prev) return
  // world point under cursor before zoom
  const wx = (sx - this.panX) / prev
  const wy = (sy - this.panY) / prev
  // apply new scale
  this.scale = clamped
  // keep that world point under the cursor
  this.panX = sx - wx * this.scale
  this.panY = sy - wy * this.scale
  this.notifyState()
  this.requestRedraw()
}

private cancelInteractions() {
  this.isPrimaryDown = false
  this.downWorld = null
  this.lastWorld = null
  this.downHit = null
  this.mode = 'idle'
  if (this.viewport) this.viewport.style.cursor = 'default'
}

private onPointerCancel = () => { this.cancelInteractions() }
private onLostPointerCapture = () => { this.cancelInteractions() }


  zoomIn(sx?: number, sy?: number) {
    if (!this.canvas || sx === undefined || sy === undefined) { this.setScale(this.scale + this.stepZoom); return }
    this.setScaleAtCursor(this.scale + this.stepZoom, sx, sy)
  }
  zoomOut(sx?: number, sy?: number) {
    if (!this.canvas || sx === undefined || sy === undefined) { this.setScale(this.scale - this.stepZoom); return }
    this.setScaleAtCursor(this.scale - this.stepZoom, sx, sy)
  }

  setPan(x: number, y: number) {
    this.panX = x;
    this.panY = y;
    this.notifyState()
    this.requestRedraw()
  }

  resize(w: number, h: number) {
    if (!this.canvas) return
    this.width = Math.max(200, Math.floor(w))
    this.height = Math.max(200, Math.floor(h))
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.floor(this.width * dpr)
    this.canvas.height = Math.floor(this.height * dpr)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    const ctx = this.canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.notifyState()
    this.requestRedraw()
  }

  requestRedraw() {
    if (this.dirty) return
    this.dirty = true
    requestAnimationFrame(() => {
      this.dirty = false
      this.drawFrame()
    })
  }

  fitToScene(pad = 40) {
    if (!this.canvas || !this.scene || !this.bounds) return
    const b = this.bounds(this.scene)
    if (!b) return
    const w = b.maxX - b.minX
    const h = b.maxY - b.minY
    const scaleX = (this.width - pad * 2) / Math.max(w, 1)
    const scaleY = (this.height - pad * 2) / Math.max(h, 1)
    this.scale = Math.min(this.maxZoom, Math.max(this.minZoom, Math.min(scaleX, scaleY)))
    this.panX = -b.minX * this.scale + pad + (this.width - w * this.scale) / 2
    this.panY = -b.minY * this.scale + pad + (this.height - h * this.scale) / 2
    this.requestRedraw()
  }


  /** Promise that resolves right after the next drawFrame completes */
  awaitNextDraw(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.nextDrawResolvers.push(resolve)
      // ensure we actually draw soon
      this.requestRedraw()
    })
  }

  private flushNextDrawResolvers() {
    const resolvers = this.nextDrawResolvers
    this.nextDrawResolvers = []
    for (const r of resolvers) r()
  }

  /* -------------------------------- draw ------------------------------- */

  private drawFrame() {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d')
    if (!ctx || !this.viewport) return

    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, this.width, this.height)

    this.draw?.drawBackground?.(this.bgState(ctx))

    ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, dpr * this.panX, dpr * this.panY)
    const sceneState = this.sceneState(ctx)
    this.draw?.drawScene?.(sceneState)
    this.draw?.drawOverlay?.(sceneState)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.draw?.drawHud?.(this.bgState(ctx))

    // after finishing a frame, also notify (keeps any listeners in sync)
    this.notifyState()

    // ✅ resolve any waiters right AFTER the frame finishes
    this.flushNextDrawResolvers()
  }

  /* ------------------------------ events ------------------------------ */

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const rect = this.canvas!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const ZOOM_SENSITIVITY = 0.0015
    const dz = -e.deltaY
    const nextScale = this.scale * Math.exp(dz * ZOOM_SENSITIVITY)
    const consumed = this.pointer?.onWheel?.(nextScale - this.scale, this.bgStateUnsafe())
    if (!consumed) this.setScaleAtCursor(nextScale, sx, sy)
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.canvas) return
    if (e.button !== 0) return // only primary button starts interactions
    try { (e.target as Element).setPointerCapture?.(e.pointerId) } catch { }

    this.isPrimaryDown = true
    const { world } = this.getCoords(e)
    this.downWorld = world
    this.lastWorld = world

    // record what we pressed on; BUT don't act until threshold is exceeded
    this.downHit = this.hitTest?.(world.x, world.y, this.bgStateUnsafe()) ?? null
    this.mode = 'idle'

    // let consumer know a press occurred
    this.pointer?.onPointerDown?.(e, this.downHit, this.bgStateUnsafe())
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.canvas) return
    const { world } = this.getCoords(e)
    const drag = this.lastWorld ? { dx: world.x - this.lastWorld.x, dy: world.y - this.lastWorld.y } : null
    this.lastWorld = world

    // If mouse isn't down, we are just hovering — nothing to do.
    if (!this.isPrimaryDown) {
      const isBox = this.hitTest?.(world.x, world.y, this.bgStateUnsafe()) ?? null
      if (isBox) {
        if (this.viewport) this.viewport.style.cursor = 'grab'
      } else {
        if (this.viewport) this.viewport.style.cursor = 'default'
      }
      return
    }

    // If we haven't decided mode yet, check threshold
    if (this.mode === 'idle' && this.downWorld) {
      const dist = Math.hypot(world.x - this.downWorld.x, world.y - this.downWorld.y)
      if (dist >= this.moveThreshold) {
        // Decide mode: drag box if we pressed on a box, else pan
        if (this.downHit) {
          this.mode = 'dragBox'
          if (this.viewport) this.viewport.style.cursor = 'grabbing'
        } else {
          this.mode = 'pan'
          this.panStartX = e.clientX - this.panX
          this.panStartY = e.clientY - this.panY
          this.pointer?.onPanStart?.(this.bgStateUnsafe())
          if (this.viewport) this.viewport.style.cursor = 'grabbing'
        }
      }
    }

    // Act based on mode
    if (this.mode === 'dragBox') {
      const consumed = this.pointer?.onPointerMove?.(e, drag, this.downHit, this.bgStateUnsafe())
      if (consumed) { this.requestRedraw(); return }
    } else if (this.mode === 'pan') {
      this.panX = e.clientX - this.panStartX
      this.panY = e.clientY - this.panStartY
      this.pointer?.onPan?.(this.bgStateUnsafe())
      this.requestRedraw()
    }
  }

  private onPointerUp = (e: PointerEvent) => {
    if (!this.canvas) return
    if (e.button !== 0) return
    try { (e.target as Element).releasePointerCapture?.(e.pointerId) } catch { }

    // If we ended in drag mode, send the up with the original hit (box)
    const hitForUp = this.mode === 'dragBox'
      ? this.downHit
      : (this.hitTest?.(this.lastWorld?.x ?? 0, this.lastWorld?.y ?? 0, this.bgStateUnsafe()) ?? null)

    this.pointer?.onPointerUp?.(e, hitForUp, this.bgStateUnsafe())

    if (this.mode === 'pan') {
       this.pointer?.onPanEnd?.(this.bgStateUnsafe())
       if (this.viewport) this.viewport.style.cursor = 'default'
    }

    // reset state
    this.cancelInteractions()
  }

  private onClick = (e: MouseEvent) => {
    if (!this.canvas) return
    const { world } = this.getCoords(e)
    const hit = this.hitTest?.(world.x, world.y, this.bgStateUnsafe()) ?? null
    this.pointer?.onClick?.(e, hit, this.bgStateUnsafe())
  }

  private onDblClick = (e: MouseEvent) => {
    if (!this.canvas) return
    const { world } = this.getCoords(e)
    const hit = this.hitTest?.(world.x, world.y, this.bgStateUnsafe()) ?? null
    this.pointer?.onDblClick?.(e, hit, this.bgStateUnsafe())
  }

  private onContextMenu = (e: MouseEvent) => {
    if (this.suppressContextMenu) e.preventDefault()
  }


  private bind() {
    if (!this.canvas) return
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false })
    this.canvas.addEventListener('pointerdown', this.onPointerDown, { passive: true })
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    window.addEventListener('pointerup', this.onPointerUp, { passive: true })
    this.canvas.addEventListener('click', this.onClick)
    this.canvas.addEventListener('dblclick', this.onDblClick)
    this.canvas.addEventListener('contextmenu', this.onContextMenu)
    this.canvas.addEventListener('pointercancel', this.onPointerCancel as any, { passive: true })
    this.canvas.addEventListener('lostpointercapture', this.onLostPointerCapture as any)
    window.addEventListener('blur', this.onPointerCancel as any)
  }

  private unbind() {
    if (!this.canvas) return
    this.canvas.removeEventListener('wheel', this.onWheel as any)
    this.canvas.removeEventListener('pointerdown', this.onPointerDown as any)
    window.removeEventListener('pointermove', this.onPointerMove as any)
    window.removeEventListener('pointerup', this.onPointerUp as any)
    this.canvas.removeEventListener('click', this.onClick as any)
    this.canvas.removeEventListener('dblclick', this.onDblClick as any)
    this.canvas.removeEventListener('contextmenu', this.onContextMenu as any)
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel as any)
    this.canvas.removeEventListener('lostpointercapture', this.onLostPointerCapture as any)
    window.removeEventListener('blur', this.onPointerCancel as any)
  }

  /* ------------------------------ helpers ----------------------------- */

  private getCoords(e: MouseEvent | PointerEvent) {
    const rect = this.canvas!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = this.toWorld(sx, sy)
    return { sx, sy, world }
  }

  private toWorld = (sx: number, sy: number) => ({
    x: (sx - this.panX) / this.scale,
    y: (sy - this.panY) / this.scale,
  })

  private bgState(ctx: CanvasRenderingContext2D): Omit<EngineState<TScene>, 'withTransform' | 'toWorld'> {
    return {
      canvas: this.canvas!, ctx, viewport: this.viewport!,
      width: this.width, height: this.height,
      scale: this.scale, panX: this.panX, panY: this.panY,
      scene: this.scene,
    }
  }

  private sceneState(ctx: CanvasRenderingContext2D): EngineState<TScene> {
    return {
      canvas: this.canvas!, ctx, viewport: this.viewport!,
      width: this.width, height: this.height,
      scale: this.scale, panX: this.panX, panY: this.panY,
      scene: this.scene,
      toWorld: this.toWorld,
      withTransform: <R>(fn: () => R) => fn(),
    }
  }

  private bgStateUnsafe(): EngineState<TScene> {
    const ctx = this.canvas!.getContext('2d')!
    return { ...this.sceneState(ctx), withTransform: <R>(fn: () => R) => fn() }
  }
}
