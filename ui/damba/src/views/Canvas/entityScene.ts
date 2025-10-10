import { CanvasBox, VisibilityTypeClass } from "../../../../../common/Entity/CanvasBox";
import { CanvasBoxAtributes, VisibilityTypeAttributes, RelationshipTypeEnum } from "../../../../../common/Entity/CanvasBoxAtributes";
import { TypeAttbutesTypeOrm } from "../../../../../common/Entity/TypeAttributesTypeOrm";
import { DrawCallbacks, HitTest, PointerHandlers } from "./GenericCanvasEngine";


export type EntityScene = { canvasBoxes: CanvasBox[]; selectedBoxId?: string | number }
export type Hit = { kind: 'box'; id: string | number } | { kind: 'scene' }

export const DiagramConfig = {
    box: { width: 200, height: 50, headerHeight: 30, attributeHeight: 20, startX: 50, startY: 50, yOffSet: 150 },
    initial: { x: 50, y: 50, yOffset: 150 },
    drawing: { dotRadius: 3, textPadding: 10, textBaseline: 15 },
}

// entityScene.ts
export type MenuItem = {
  id: string
  label: string
  danger?: boolean
  shortcut?: string
  onClick: (args: {
    scene: EntityScene
    hit: Hit & { kind: 'box' }
    close: () => void
    centerOn?: (rect: { x: number; y: number; w: number; h: number }) => void
    fit?: () => void
  }) => void
}

const lblClass = (att: VisibilityTypeClass | undefined, name: string) => {
    switch (att) {
        case VisibilityTypeClass.PRIVATE: return '-' + name
        case VisibilityTypeClass.PUBLIC: return '+' + name
        case VisibilityTypeClass.PROTECTED: return '#' + name
        case VisibilityTypeClass.IMPLEMENTATION: return name
        default: return name
    }
}

const resolveType = (t: TypeAttbutesTypeOrm | string, obj: CanvasBoxAtributes, scene: EntityScene) => {
    try {
        const boxes = scene.canvasBoxes ?? []
        const idx = boxes.findIndex(b => b.id === obj.relation?.targetEntity)
        if (idx === -1) return String(t)
        const box = boxes[idx]
        return box?.entityName ?? String(t)
    } catch {
        return String(t)
    }
}

const lblAttr = (obj: CanvasBoxAtributes, scene: EntityScene) => {
    const name = `${obj.name}(${resolveType(obj.type ?? '', obj, scene)})`
    switch (obj.visibility) {
        case VisibilityTypeAttributes.PRIVATE: return '-' + name
        case VisibilityTypeAttributes.PUBLIC: return '+' + name
        case VisibilityTypeAttributes.PROTECTED: return '#' + name
        case VisibilityTypeAttributes.IMPLEMENTATION: return name
        default: return name
    }
}

const relText = (t?: any) => {
    switch (t) {
        case RelationshipTypeEnum.ONE_TO_ONE: return '1 to 1'
        case RelationshipTypeEnum.ONE_TO_MANY: return '1 to N'
        case RelationshipTypeEnum.MANY_TO_ONE: return 'N to 1'
        case RelationshipTypeEnum.MANY_TO_MANY: return 'N to N'
        default: return ''
    }
}

const snap = (n: number) => Math.round(n) + 0.5

export const drawEntities: DrawCallbacks<EntityScene> = {
    drawBackground: ({ ctx, width, height, panX, panY, scale }) => {
        ctx.save()
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 0.5
        const grid = 50
        const offX = panX / scale
        const offY = panY / scale
        for (let x = -offX % grid; x < width; x += grid) {
            ctx.beginPath(); ctx.moveTo(snap(x), 0); ctx.lineTo(snap(x), height); ctx.stroke()
        }
        for (let y = -offY % grid; y < height; y += grid) {
            ctx.beginPath(); ctx.moveTo(0, snap(y)); ctx.lineTo(width, snap(y)); ctx.stroke()
        }
        ctx.restore()
    },

    drawScene: ({ ctx, scene }) => {
        if (!scene) return
        const { box: boxCfg, drawing } = DiagramConfig
        const drawnLines = new Set<string>()
        const boxes = scene.canvasBoxes ?? []

        boxes.forEach((canvasBox, index) => {
            const x = canvasBox.x ?? DiagramConfig.initial.x
            const y = canvasBox.y ?? DiagramConfig.initial.y + index * DiagramConfig.initial.yOffset
            const { width, height, headerHeight, attributeHeight } = boxCfg
            const rows = canvasBox.attributes?.length ?? 0
            const isSelected = scene.selectedBoxId != null && scene.selectedBoxId === canvasBox.id

            ctx.save()
            ctx.strokeStyle = isSelected ? 'green' : 'black'
            ctx.strokeRect(snap(x), snap(y), Math.round(width), Math.round(height + attributeHeight * rows))

            ctx.fillStyle = isSelected ? 'green' : 'lightgray'
            ctx.fillRect(x, y, width, headerHeight)

            ctx.fillStyle = 'black'
            ctx.fillText(
                lblClass(canvasBox.visibility ?? VisibilityTypeClass.IMPLEMENTATION, canvasBox.entityName ?? ''),
                x + drawing.textPadding,
                y + drawing.textBaseline
            )

            canvasBox.attributes?.forEach((attribute, i) => {
                const ay = y + headerHeight + i * attributeHeight
                ctx.strokeRect(snap(x), snap(ay), Math.round(width), Math.round(attributeHeight))
                ctx.fillText(lblAttr(attribute, scene), x + drawing.textPadding, ay + drawing.textBaseline)

                ctx.beginPath(); ctx.arc(x, ay + attributeHeight / 2, drawing.dotRadius, 0, 2 * Math.PI); ctx.fill()
                ctx.beginPath(); ctx.arc(x + width, ay + attributeHeight / 2, drawing.dotRadius, 0, 2 * Math.PI); ctx.fill()

                if (attribute.isMapped && attribute.relation) {
                    const target = boxes.find(b => b.id === attribute.relation!.targetEntity)
                    if (target && target.attributes) {
                        const tx = target.x ?? DiagramConfig.initial.x
                        const ty = target.y ?? DiagramConfig.initial.y + boxes.indexOf(target) * DiagramConfig.initial.yOffset
                        const tIdx = target.attributes.findIndex(a => a.id === attribute.relation!.targetEntityAttribute)
                        const tay = ty + headerHeight + tIdx * attributeHeight

                        const k = `${canvasBox.id}-${attribute.id}-${target.id}-${attribute.relation.targetEntityAttribute}`
                        const rk = `${target.id}-${attribute.relation.targetEntityAttribute}-${canvasBox.id}-${attribute.id}`
                        if (!drawnLines.has(k) && !drawnLines.has(rk)) {
                            ctx.beginPath()
                            ctx.moveTo(snap(x + width), snap(ay + attributeHeight / 2))
                            ctx.lineTo(snap(tx), snap(tay + attributeHeight / 2))
                            ctx.strokeStyle = 'black'
                            ctx.stroke()

                            drawnLines.add(k); drawnLines.add(rk)

                            const label = relText(attribute.relation.type)
                            if (label) ctx.fillText(label, (x + width + tx) / 2, (ay + tay) / 2)
                        }
                    }
                }
            })
            ctx.restore()

            canvasBox.x = x
            canvasBox.y = y
            canvasBox.width = width
            canvasBox.height = height + attributeHeight * rows
        })
    },
}

export const hitTestEntities: HitTest<EntityScene, Hit> = (wx, wy, { scene }) => {
    const boxes: CanvasBox[] = scene?.canvasBoxes ?? []
    const box = boxes.find(b =>
        wx >= (b.x ?? 0) && wx <= (b.x ?? 0) + (b.width ?? DiagramConfig.box.width) &&
        wy >= (b.y ?? 0) && wy <= (b.y ?? 0) + (b.height ?? DiagramConfig.box.height)
    )
    return box ? { kind: 'box', id: box.id } : null   // ✅ null on empty space
}


export const pointerHandlers = (
    onDrag?: (id: string | number, dx: number, dy: number) => void,
    onSelect?: (id: string | number | null) => void
): PointerHandlers<EntityScene, Hit> => ({


    onPointerDown: (_e, hit, state) => {
        if (hit?.kind === 'box') {
            onSelect?.(hit.id);
            state.viewport.style.cursor = 'grabbing'
            return true
        } // consume start of drag
        return false // let engine decide pan after threshold
    },

    onPointerMove: (_e, drag, hit, state) => {
        if (hit?.kind === 'box' && drag) {
            const b = state.scene?.canvasBoxes.find(bb => bb.id === hit.id)
            if (!b) return true
            b.x = (b.x ?? 0) + drag.dx
            b.y = (b.y ?? 0) + drag.dy
            onDrag?.(b.id, drag.dx, drag.dy)
            return true // engine will redraw
        }
        return false
    },

    onPointerUp: (_e, _hit, state) => {
        state.viewport.style.cursor = 'default'      // 👈 restore cursor
    },
    onClick: (_e, hit, state) => {
        if (!hit) onSelect?.(null) // deselect when clicking empty
        state.viewport.style.cursor = 'default'
    },
})




// entityScene.ts (add this near the bottom)
export const entityBounds = (scene: EntityScene) => {
    const boxes = scene?.canvasBoxes ?? []
    if (!boxes.length) return null

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const b of boxes) {
        const x = b.x ?? 0
        const y = b.y ?? 0
        const w = b.width ?? 200 // fallback to your default box width
        const h = b.height ?? 50 // fallback to your default box height
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + w)
        maxY = Math.max(maxY, y + h)
    }
    return { minX, minY, maxX, maxY }
}

export function computeBoxRect(scene: EntityScene, index: number) {
    const box = scene.canvasBoxes[index]
    const { width, height, attributeHeight, startX, startY, yOffSet } = DiagramConfig.box
    const attrCount = box?.attributes?.length ?? 0
    const w = box?.width ?? width
    const h = (box?.height ?? height) + attrCount * attributeHeight
    const x = box?.x ?? startX
    const y = box?.y ?? (startY + index * yOffSet)
    return { x, y, w, h }
}
