/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { CanvasBox, VisibilityTypeClass } from "../../../../../common/Entity/CanvasBox";
import { CanvasBoxAtributes, RelationshipTypeEnum, VisibilityTypeAttributes } from "../../../../../common/Entity/CanvasBoxAtributes";
import { TypeAttbutesTypeOrm } from "../../../../../common/Entity/TypeAttributesTypeOrm";
import Checkbox from "@/components/ui/Checkbox";
import { AppModule, Service } from "../../../../../common/Entity/project";
import { CanvasViewport } from "./CanvasViewport";

type Props = {
  cmodule: AppModule;
  initialWidth?: number;
  initialHeight?: number;
  // callbacks
  onServiceSelected?: (id: string | number) => void;
};

// --- change these defaults as needed ---
const TELEPORTER_MAX_WIDTH = "100%";
const TELEPORTER_MAX_HEIGHT = "1400px";

export default function JsonDiagram({ cmodule, initialWidth = 5000, initialHeight = 2500, onServiceSelected }: Props) {

  // ALL USESTATE
  const [canvasX, setCanvasX] = useState<number>(initialWidth);
  const [canvasY, setCanvasY] = useState<number>(initialHeight);

  const [scale, setScale] = useState<number>(1);
  const stepZoom = 0.025;
  const minZoom = 0.01;
  const maxZoom = 5;

  const [cModule, setCModule] = useState<AppModule | null>(null);

  const [cServices, setCServices] = useState<Service | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(cModule?.config?.canvas?.showGrid || true);
  // ALL USEREF
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const teleporterRef = useRef<HTMLDivElement | null>(null);
  const DiagramConfig = useRef({
    box: {
      width: 200,
      height: 50,
      headerHeight: 30,
      attributeHeight: 20,
    },
    initial: {
      x: 50,
      y: 50,
      yOffset: 150,
    },
    drawing: {
      dotRadius: 3,
      textPadding: 10,
      textBaseline: 15,
    },
  }).current;

  const isDraggingRef = useRef(false);
  const dragOffsetXRef = useRef(0);
  const dragOffsetYRef = useRef(0);
  const selectedBoxIndexRef = useRef<number | null>(null);
  const isPanningRef = useRef(false);
  const panStartXRef = useRef(0);
  const panStartYRef = useRef(0);
  const panOffsetXRef = useRef(0); // offset for canvas movement
  const panOffsetYRef = useRef(0);
  const cServicesRef = useRef<Service | null>(null);
  const draggingBoxIdRef = useRef<number | string | null>(null);

  useEffect(() => { cServicesRef.current = cServices; }, [cServices]);

  useEffect(() => {
    setCModule(cmodule);
  }, [cmodule]);



  useEffect(() => {
    const el = teleporterRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasX(Math.max(200, Math.floor(width)));
        setCanvasY(Math.max(200, Math.floor(height)));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    drawDiagram();
  }, [canvasX, canvasY, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -stepZoom : stepZoom;
      setScale(prev => Math.min(Math.max(prev + delta, minZoom), maxZoom));
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };

  }, []);

  useEffect(() => {
    if (!cModule) return;
    if (!cModule.services || cModule.services.length === 0) return;
    setCServices(cModule.services[0]);
    onServiceSelected?.(cModule.services[0].id);
    setTimeout(() => {
      const firstBox: any = assignRandomPositions();
      if (firstBox) {
        const viewportWidth = teleporterRef.current?.clientWidth ?? canvasX;
        const viewportHeight = teleporterRef.current?.clientHeight ?? canvasY;

        panOffsetXRef.current = viewportWidth / 2 - (firstBox.x ?? 0) * scale - ((firstBox.width ?? 0) / 2) * scale;
        panOffsetYRef.current = viewportHeight / 2 - (firstBox.y ?? 0) * scale - ((firstBox.height ?? 0) / 2) * scale;

        drawDiagram();
        setScale(1.15); // optional: initial zoom
      }
    }, 0);
  }, [cModule]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    const el = teleporterRef.current;
    if (!el) return;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panOffsetXRef.current) / scale;
      const mouseY = (e.clientY - rect.top - panOffsetYRef.current) / scale;

      const svc = cServicesRef.current;
      if (!svc || !svc.canvasBoxes) return;

      // Check if clicked on a box
      const idx = svc.canvasBoxes.findIndex(box =>
        mouseX >= (box.x ?? 0) && mouseX <= (box.x ?? 0) + (box.width ?? 0) &&
        mouseY >= (box.y ?? 0) && mouseY <= (box.y ?? 0) + (box.height ?? 0)
      );

      if (idx !== -1) {
        // Clicked on a box → start dragging
        selectedBoxIndexRef.current = idx;
        isDraggingRef.current = true;

        const box = svc.canvasBoxes[idx];
        dragOffsetXRef.current = mouseX - (box.x ?? 0);
        dragOffsetYRef.current = mouseY - (box.y ?? 0);

        draggingBoxIdRef.current = box.id; // ✅ use ref for immediate drawing
        drawDiagram();             // update border color
      } else {
        // Clicked on empty space → start panning
        isPanningRef.current = true;
        panStartXRef.current = e.clientX - panOffsetXRef.current;
        panStartYRef.current = e.clientY - panOffsetYRef.current;
      }

      el.style.cursor = "grab";
    };

    const onMouseMove = (e: MouseEvent) => {
      const svc = cServicesRef.current;
      if (!svc) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panOffsetXRef.current) / scale;
      const mouseY = (e.clientY - rect.top - panOffsetYRef.current) / scale;

      if (isDraggingRef.current || isPanningRef.current) {
        // ✅ show grabbing cursor while moving
        el.style.cursor = "grabbing";
      }

      if (isDraggingRef.current && selectedBoxIndexRef.current !== null) {
        // Dragging the selected box
        const box = svc.canvasBoxes[selectedBoxIndexRef.current];
        box.x = mouseX - dragOffsetXRef.current;
        box.y = mouseY - dragOffsetYRef.current;
        drawDiagram();
      } else if (isPanningRef.current) {
        // Panning the canvas
        panOffsetXRef.current = e.clientX - panStartXRef.current;
        panOffsetYRef.current = e.clientY - panStartYRef.current;
        drawDiagram();
      }
    };

    const onMouseUp = () => {
      if (isDraggingRef.current && selectedBoxIndexRef.current !== null) {
        draggingBoxIdRef.current = null;
        drawDiagram();
      }

      // Reset dragging/panning state
      isDraggingRef.current = false;
      selectedBoxIndexRef.current = null;
      isPanningRef.current = false;
      el.style.cursor = "default";
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [scale]);






  const scrollToBox = (firstBox: CanvasBox | undefined | null) => {
    if (!firstBox || !teleporterRef.current) return;
    const left = (firstBox.x ?? 0) * scale - ((firstBox.width ?? 0) * 2);
    const top = (firstBox.y ?? 0) * scale - ((firstBox.height ?? 0) * 2);
    teleporterRef.current.scrollTo({ left, top, behavior: "smooth" });
  };

  const panToBox = (box: CanvasBox) => {
    if (!box) return;

    // Center the box in the canvas viewport
    const viewportWidth = teleporterRef.current?.clientWidth ?? canvasX;
    const viewportHeight = teleporterRef.current?.clientHeight ?? canvasY;

    const targetX = (viewportWidth / 2 - (box.x ?? 0) * scale - ((box.width ?? 0) / 2) * scale);
    const targetY = (viewportHeight / 2 - (box.y ?? 0) * scale - ((box.height ?? 0) / 2) * scale);

    panOffsetXRef.current = targetX;
    panOffsetYRef.current = targetY;

    drawDiagram();
  };

  const getRandomPosition = (pos: number): { x: number; y: number } => {
    const svc = cServicesRef.current;
    let x = 0, y = 0;
    if (!svc) return { x: 0, y: 0 };

    if (pos === 0) {
      const paddingMax = 100;
      x = DiagramConfig.initial.x + (Math.random() * (canvasX / 2 - DiagramConfig.box.width - paddingMax));
      y = DiagramConfig.initial.y + (Math.random() * (canvasY / 2 - DiagramConfig.box.height - paddingMax));
    } else {
      const previousBox = svc.canvasBoxes[pos - 1];
      const paddingMin = previousBox.width ?? 100;
      const paddingMax = (previousBox.width ?? 150) * 2;
      const px = previousBox.x ?? DiagramConfig.initial.x;
      const py = previousBox.y ?? DiagramConfig.initial.y;
      const angle = Math.random() * 2 * Math.PI;
      const distance = paddingMin + Math.random() * (paddingMax - paddingMin);
      x = px + Math.cos(angle) * distance + (previousBox.width ?? 0);
      y = py + Math.sin(angle) * distance + (previousBox.height ?? 0);
      x = Math.max(paddingMin, Math.min(x, canvasX / 2 - DiagramConfig.box.width - paddingMax));
      y = Math.max(paddingMin, Math.min(y, canvasY / 2 - DiagramConfig.box.height - paddingMax));
    }
    return { x, y };
  };

  const assignRandomPositions = () => {
    const svc = cServicesRef.current;
    if (!svc) return;

    let firstBox: CanvasBox | null = null;

    svc.canvasBoxes.forEach((canvasBox, index) => {
      const pos = getRandomPosition(index);
      canvasBox.x = pos.x;
      canvasBox.y = pos.y;
      if (index === 0) firstBox = canvasBox;

      // Set width/height for drawing later
      const { width, height, attributeHeight, headerHeight } = DiagramConfig.box;
      canvasBox.width = width;
      canvasBox.height = height + (canvasBox.attributes?.length || 0) * attributeHeight;

    });

    return firstBox;
  };

  const drawGrid = (ctx: any, canvas: any) => {
    // ----- Draw GRID in BACKGROUND -----
    ctx.save();
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;

    // Draw across the **entire canvas** dimensions
    const gridSize = 50;
    const totalWidth = canvas.width;
    const totalHeight = canvas.height;

    // Account for pan and scale to align grid
    const offsetX = panOffsetXRef.current / scale;
    const offsetY = panOffsetYRef.current / scale;

    for (let x = -offsetX % gridSize; x < totalWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalHeight);
      ctx.stroke();
    }

    for (let y = -offsetY % gridSize; y < totalHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(totalWidth, y);
      ctx.stroke();
    }

    ctx.restore();

  }

  const drawDiagram = () => {
    const canvas = canvasRef.current;
    const svc = cServicesRef.current;
    if (!canvas || !svc) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== canvasX) canvas.width = canvasX;
    if (canvas.height !== canvasY) canvas.height = canvasY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { box: boxCfg, drawing } = DiagramConfig;

    if (showGrid) drawGrid(ctx, canvas);

    const drawnLines = new Set<string>();

    svc.canvasBoxes.forEach((canvasBox, index) => {
      const x = canvasBox.x ?? DiagramConfig.initial.x;
      const y = canvasBox.y ?? DiagramConfig.initial.y + index * DiagramConfig.initial.yOffset;
      const { width, height, headerHeight, attributeHeight } = boxCfg;

      ctx.save();

      ctx.setTransform(scale, 0, 0, scale, panOffsetXRef.current, panOffsetYRef.current);

      const sHeight = canvasBox?.attributes?.length ?? 0;
      const isSelected = canvasBox.id == draggingBoxIdRef.current;
      ctx.strokeStyle = isSelected ? "green" : "black";
      ctx.strokeRect(x, y, width, height + (attributeHeight * sHeight));

      ctx.fillStyle = isSelected ? "green" : "lightgray";
      ctx.fillRect(x, y, width, headerHeight);

      ctx.fillStyle = "black";
      ctx.fillText(getClassName(canvasBox.visibility ?? VisibilityTypeClass.IMPLEMENTATION, canvasBox.entityName ?? ""), x + drawing.textPadding, y + drawing.textBaseline);

      if (!canvasBox.attributes) {
        ctx.restore();
        canvasBox.x = x;
        canvasBox.y = y;
        canvasBox.width = width;
        canvasBox.height = height;
        return;
      }

      canvasBox.attributes.forEach((attribute, attrIndex) => {
        const attrY = y + headerHeight + attrIndex * attributeHeight;
        ctx.strokeRect(x, attrY, width, attributeHeight);
        ctx.fillText(getAttributeName(attribute), x + drawing.textPadding, attrY + drawing.textBaseline);
        ctx.beginPath();
        ctx.arc(x, attrY + attributeHeight / 2, drawing.dotRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width, attrY + attributeHeight / 2, drawing.dotRadius, 0, 2 * Math.PI);
        ctx.fill();

        if (attribute.isMapped && attribute.relation) {
          const targetBox = svc.canvasBoxes.find(box => box.id === attribute.relation?.targetEntity);
          if (targetBox && targetBox.attributes) {
            const targetX = targetBox.x ?? DiagramConfig.initial.x;
            const targetY = targetBox.y ?? DiagramConfig.initial.y + svc.canvasBoxes.indexOf(targetBox) * DiagramConfig.initial.yOffset;
            const targetAttrIndex = targetBox.attributes.findIndex(attr => attr.id === attribute.relation?.targetEntityAttribute);
            const targetAttrY = targetY + headerHeight + (targetAttrIndex * attributeHeight);

            const lineKey = `${canvasBox.id}-${attribute.id}-${targetBox.id}-${attribute.relation.targetEntityAttribute}`;
            const reverseLineKey = `${targetBox.id}-${attribute.relation.targetEntityAttribute}-${canvasBox.id}-${attribute.id}`;

            if (!drawnLines.has(lineKey) && !drawnLines.has(reverseLineKey)) {
              ctx.beginPath();
              ctx.moveTo(x + width, attrY + attributeHeight / 2);
              ctx.lineTo(targetX, targetAttrY + attributeHeight / 2);
              ctx.strokeStyle = "black";
              ctx.stroke();
              drawnLines.add(lineKey);
              drawnLines.add(reverseLineKey);

              let relationText = "";
              switch (attribute.relation.type) {
                case RelationshipTypeEnum.ONE_TO_ONE:
                  relationText = "1 to 1";
                  break;
                case RelationshipTypeEnum.MANY_TO_ONE:
                  relationText = "N to 1";
                  break;
                case RelationshipTypeEnum.ONE_TO_MANY:
                  relationText = "1 to N";
                  break;
                case RelationshipTypeEnum.MANY_TO_MANY:
                  relationText = "N to N";
                  break;
                default:
                  relationText = "";
              }
              ctx.fillText(relationText, (x + width + targetX) / 2, (attrY + targetAttrY) / 2);
            }
          }
        }
      });

      ctx.restore();

      canvasBox.x = x;
      canvasBox.y = y;
      canvasBox.width = width;
      canvasBox.height = height + (canvasBox.attributes?.length || 0) * attributeHeight;
    });
  };

  const getAttributeName = (obj: CanvasBoxAtributes) => {
    const att = obj.visibility;
    const name = obj.name + "(" + getType(obj.type ?? "", obj) + ")";
    switch (att) {
      case VisibilityTypeAttributes.PRIVATE: return "-" + name;
      case VisibilityTypeAttributes.PUBLIC: return "+" + name;
      case VisibilityTypeAttributes.PROTECTED: return "#" + name;
      case VisibilityTypeAttributes.IMPLEMENTATION: return name;
      default: return name;
    }
  };

  const getType = (t: TypeAttbutesTypeOrm | string, obj: CanvasBoxAtributes) => {
    try {
      const svc = cServicesRef.current;
      if (!svc || !svc.canvasBoxes) return String(t);
      const targetBoxIndex = svc.canvasBoxes.findIndex(box => box.id === obj.relation?.targetEntity);
      if (targetBoxIndex === -1) return String(t);
      const box = svc.canvasBoxes[targetBoxIndex];
      if (!box) return "#error b404";
      return box.entityName ?? String(t);
    } catch (error) {
      return String(t);
    }
  };

  const getClassName = (att: VisibilityTypeClass | undefined, name: string) => {
    switch (att) {
      case VisibilityTypeClass.PRIVATE: return "-" + name;
      case VisibilityTypeClass.PUBLIC: return "+" + name;
      case VisibilityTypeClass.PROTECTED: return "#" + name;
      case VisibilityTypeClass.IMPLEMENTATION: return name;
      default: return name;
    }
  };

  const onServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!cModule || !cModule.services) return;
    const val = e.target.value;
    const svc = cModule.services.find(s => String(s.id) === val) ?? null;
    if (svc) {
      setCServices(svc);
      onServiceSelected?.(svc.id);
      setTimeout(() => {
        assignRandomPositions();
        drawDiagram();
      }, 0);
    }
  };

  const getRandomLastPosition = () => {
    if (!cServices) return;
    let x = 0;
    let y = 0;
    if (cServices && cServices.canvasBoxes == undefined || cServices.canvasBoxes.length == 0) {
      x = DiagramConfig.initial.x;
      y = DiagramConfig.initial.y;
      const rPos = { x, y };
      return rPos;
    }

    const previousBox = cServices.canvasBoxes[cServices.canvasBoxes.length - 1];
    const paddingMin = previousBox.width ?? 100;
    const paddingMax = (previousBox.width ?? 150) * 2;
    const px = previousBox.x ?? DiagramConfig.initial.x; const py = previousBox.y ?? DiagramConfig.initial.y;

    // Random angle and distance between paddingMin and paddingMax
    const angle = Math.random() * 2 * Math.PI;
    const distance = paddingMin + Math.random() * (paddingMax - paddingMin);

    let nx = px + Math.cos(angle) * distance + (previousBox.width ?? 0);
    let ny = py + Math.sin(angle) * distance + (previousBox.height ?? 0);

    // Ensure x and y are within canvas boundaries
    nx = Math.max(paddingMin, Math.min(nx, canvasX - DiagramConfig.box.width - paddingMax));
    ny = Math.max(paddingMin, Math.min(ny, canvasY - DiagramConfig.box.height - paddingMax));

    const rPos = { x: nx, y: ny };
    return rPos;
  }

  const addEntity = (e: { value: CanvasBox; component?: { next: (b: boolean) => void } }) => {
    const svc = cServicesRef.current;
    if (!svc) return;
    const p = getRandomLastPosition();
    e.value.x = (p) ? p.x : 100;
    e.value.y = (p) ? p.y : 100;
    svc.canvasBoxes.push(e.value);
    e.component?.next(true);
    scrollToBox(e.value);
    drawDiagram();
  };

  function EntityModal() { return null; }
  function CreateEntity({ onAdd }: { onAdd?: (p: any) => void }) {
    return (
      <div style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => onAdd?.({ value: { id: Date.now(), entityName: "New", attributes: [] } })}>
          Add Entity
        </button>
      </div>
    );
  }

  const onCheck = (value: boolean, e: ChangeEvent<HTMLInputElement>) => {
    setCModule(prev => prev ? {
      ...prev,
      config: {
        ...prev.config,
        canvas: {
          ...prev?.config?.canvas,
          showGrid: value,
        }
      }
    } : prev);
    setShowGrid(value);
  };

  return (
    <div className="container p-4">
      <EntityModal />
      <div className="row mb-3">
        <div className="col">
          {cModule ? (
            <>
              <label htmlFor="serviceSelect" className="form-label">Select Service</label>
              <select id="serviceSelect" className="form-select form-control" onChange={onServiceChange} value={cServices ? String(cServices.id) : ""}>
                {cModule.services?.map(service => (
                  <option key={String(service.id)} value={String(service.id)}>{service.name}</option>
                ))}
              </select>

              {cServices && <CreateEntity onAdd={(payload) => addEntity(payload)} />}

              <div style={{ marginTop: 8 }}>Zoom {scale.toFixed(2)}x</div>
            </>
          ) : (
            <div>No project loaded</div>
          )}
        </div>
      </div>

      <div className="row">
        <Checkbox checked={showGrid} onChange={onCheck} >
          Show grid
        </Checkbox>
        <div className="col">
          {/* <div className="teleporter" ref={teleporterRef} style={{
            width: "100%",
            height: 600,
            maxWidth: TELEPORTER_MAX_WIDTH,
            maxHeight: TELEPORTER_MAX_HEIGHT,
            overflow: "auto",
            border: "1px solid #ddd",
            background: "#f8f9fa",
            position: "relative",
            margin: "0 auto"
          }}>
            <canvas
              ref={canvasRef}
              width={canvasX}
              height={canvasY}
              style={{ display: "block", width: "100%", height: "100%", background: "white" }}
            />

          </div> */}

          <CanvasViewport viewportRef={teleporterRef} canvasRef={canvasRef}></CanvasViewport>
        </div>
      </div>
    </div>
  );
}
