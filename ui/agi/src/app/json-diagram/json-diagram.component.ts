import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasBox, VisibilityTypeClass } from '../Entity/CanvasBox';
import { CanvasBoxAtributes, RelationshipType, VisibilityTypeAttributes } from '../Entity/CanvasBoxAtributes';
import Projects from '../Entity/Project';
import Service from '../Entity/Services';
import { TypeAttbutesTypeOrm } from '../Entity/TypeAttributesTypeOrm';
import { AddEntityRes, CreateEntityComponent } from '../Modals/create-entity/create-entity.component';
import { FakeProject } from './project';

@Component({
  selector: 'app-json-diagram',
  templateUrl: './json-diagram.component.html',
  styleUrls: ['./json-diagram.component.scss']
})
export class JsonDiagramComponent implements AfterViewInit, OnInit {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('childComponent', { static: false }) child!: CreateEntityComponent;
  @ViewChild('teleporter') teleporter!: ElementRef<HTMLElement>; 
  jsonInput: any;
  diagramOutput: string = '';
  canvasX: any = 5000;
  canvasY: any = 2500;
  scale: number = 1;
  stepZoom = 0.05;
  minZoom = 0.1;
  maxZoom = 5;
  cProject!: Projects;
  cServices!: Service;

  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private selectedBoxIndex: number | null = null;

  // Configuration object for diagram parameters
  DiagramConfig = {
    // Default canvas box dimensions
    box: {
      width: 200,          // Width of each entity box
      height: 50,         // Base height of entity box
      headerHeight: 30,    // Height of the entity name section
      attributeHeight: 20, // Height of each attribute row
    },
    // Initial positioning
    initial: {
      x: 50,              // Starting X position for first box
      y: 50,              // Starting Y position for first box
      yOffset: 150,       // Vertical spacing between boxes
    },
    // Drawing settings
    drawing: {
      dotRadius: 3,       // Radius of connection points
      textPadding: 10,    // Padding for text from left edge
      textBaseline: 15,   // Vertical position of text within rows
    }
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
 
  
  }

  ngAfterViewInit() {
    this.cProject = FakeProject;
    this.generateDiagram();
  }

  assignRandomPositions() {

    this.cServices.canvasBoxes.forEach ((canvasBox, index) => {
      let position = this.getRandomPosition(index);
      canvasBox.x = position.x;
      canvasBox.y = position.y;
      if(index==0) {
        this.scrollToBox(canvasBox);
      }
    });

  }



  scrollToBox(firstBox : CanvasBox) {
    if (firstBox && firstBox.x !== undefined && firstBox.y !== undefined) {
      // Calculate scroll positions considering the scale
      const scrollLeft = firstBox.x * this.scale - ((firstBox.width?? 0) * 2);
      const scrollTop = firstBox.y * this.scale  - ((firstBox.height?? 0) * 2) ;

      this.teleporter.nativeElement.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }

  getRandomPosition(pos: number) {
    let x = 0;
    let y = 0;
   
  
    if (pos === 0) {
      const paddingMax = 100;
      x = this.DiagramConfig.initial.x + (Math.random() * (this.canvasX/2 - this.DiagramConfig.box.width - paddingMax));
      y = this.DiagramConfig.initial.y + (Math.random() * (this.canvasY/2 - this.DiagramConfig.box.height - paddingMax));
    } else {
   
      const previousBox = this.cServices.canvasBoxes[pos - 1];
      const paddingMin = previousBox.width ?? 100;
      const paddingMax = (previousBox.width ?? 150) * 2;
      const px = previousBox.x ?? this.DiagramConfig.initial.x;      const py = previousBox.y ?? this.DiagramConfig.initial.y;
  
      // Random angle and distance between paddingMin and paddingMax
      const angle = Math.random() * 2 * Math.PI;
      const distance = paddingMin + Math.random() * (paddingMax - paddingMin);
  
      x = px + Math.cos(angle) * distance + (previousBox.width ?? 0);
      y = py + Math.sin(angle) * distance + (previousBox.height ?? 0);
  
      // Ensure x and y are within canvas boundaries
      x = Math.max(paddingMin, Math.min(x, this.canvasX/2 - this.DiagramConfig.box.width - paddingMax));
      y = Math.max(paddingMin, Math.min(y, this.canvasY/2 - this.DiagramConfig.box.height - paddingMax));
    }
  
    const rPos = { x, y };
    return rPos;
  }

  



  onServiceChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedServiceId = selectElement.value;
    this.cServices = this.cProject.services.find(service => service.id === selectedServiceId)!;
    this.generateDiagram(true);
  }


  generateDiagram(pos: boolean = false) {
      if (this.cProject.services.length > 0 && !pos) {
         this.cServices = this.cProject.services[0];
      }
      this.assignRandomPositions();
      this.drawDiagram();
  }





  drawDiagram() {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let e = 0;

    this.cServices.canvasBoxes.forEach((canvasBox: CanvasBox, index: number) => {
      const x = canvasBox.x ?? this.DiagramConfig.initial.x;

      const y = canvasBox.y ?? this.DiagramConfig.initial.y + index * this.DiagramConfig.initial.yOffset;
      const { width, height, headerHeight, attributeHeight } = this.DiagramConfig.box;

      ctx.save();
      ctx.scale(this.scale, this.scale);

      const drawnLines = new Set<string>();
      const sHeight = canvasBox?.attributes?.length ?? 0
      ctx.strokeRect(x, y, width, height + (attributeHeight * sHeight));


      ctx.fillStyle = 'lightgray';
      ctx.fillRect(x, y, width, headerHeight);
      ctx.fillStyle = 'black';
      ctx.fillText(this.getClassName(canvasBox.visibility, canvasBox.entityName),
        x + this.DiagramConfig.drawing.textPadding,
        y + this.DiagramConfig.drawing.textBaseline);

      if (!canvasBox.attributes) return;
      canvasBox.attributes.forEach((attribute: CanvasBoxAtributes, attrIndex: any) => {
        const attrY = y + headerHeight + attrIndex * attributeHeight;
        ctx.strokeRect(x, attrY, width, attributeHeight);
        ctx.fillText(this.getAttributeName(attribute),
          x + this.DiagramConfig.drawing.textPadding,
          attrY + this.DiagramConfig.drawing.textBaseline);

        ctx.beginPath();
        ctx.arc(x, attrY + attributeHeight / 2, this.DiagramConfig.drawing.dotRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width, attrY + attributeHeight / 2, this.DiagramConfig.drawing.dotRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw relation lines
        if (attribute.isMapped && attribute.relation) {
          const targetBox = this.cServices.canvasBoxes.find(box => box.id === attribute.relation?.targetEntity);
          if (targetBox && targetBox.attributes) {
            const targetX = targetBox.x ?? this.DiagramConfig.initial.x;
            const targetY = targetBox.y ?? this.DiagramConfig.initial.y + this.cServices.canvasBoxes.indexOf(targetBox) * this.DiagramConfig.initial.yOffset;
            const targetAttrIndex = targetBox.attributes.findIndex(attr => attr.id === attribute.relation?.targetEntityAttribute);
            const targetAttrY = targetY + headerHeight + (targetAttrIndex * attributeHeight ) ;

            const lineKey = `${canvasBox.id}-${attribute.id}-${targetBox.id}-${attribute.relation.targetEntityAttribute}`;
            const reverseLineKey = `${targetBox.id}-${attribute.relation.targetEntityAttribute}-${canvasBox.id}-${attribute.id}`;
            if (!drawnLines.has(lineKey) && !drawnLines.has(reverseLineKey)) {
              ctx.beginPath();
              ctx.moveTo(x + width, attrY + attributeHeight / 2);
              ctx.lineTo(targetX, targetAttrY + attributeHeight / 2);
              ctx.strokeStyle = 'black';
              ctx.stroke();
              drawnLines.add(lineKey);
              drawnLines.add(reverseLineKey);

              // Add relation type text
              let relationText = '';
              switch (attribute.relation.type) {
                case RelationshipType.ONE_TO_ONE:
                  relationText = '1 to 1';
                  break;
                case RelationshipType.MANY_TO_ONE:
                  relationText = 'N to 1';
                  break;
                case RelationshipType.ONE_TO_MANY:
                  relationText = '1 to N';
                  break;
                case RelationshipType.MANY_TO_MANY:
                  relationText = 'N to N';
                  break;
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
      e++;
    });

    // Mouse event handlers remain unchanged
    if (!canvas.onmousedown) {
      canvas.onmousedown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / this.scale;
        const mouseY = (e.clientY - rect.top) / this.scale;

        this.selectedBoxIndex = this.cServices.canvasBoxes.findIndex(box =>
          mouseX >= box.x! && mouseX <= box.x! + box.width! &&
          mouseY >= box.y! && mouseY <= box.y! + box.height!
        );

        if (this.selectedBoxIndex !== -1) {
          this.isDragging = true;
          const box = this.cServices.canvasBoxes[this.selectedBoxIndex];
          this.dragOffsetX = mouseX - box.x!;
          this.dragOffsetY = mouseY - box.y!;
        }
      };

      canvas.onmousemove = (e: MouseEvent) => {
        if (this.isDragging && this.selectedBoxIndex !== null) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = (e.clientX - rect.left) / this.scale;
          const mouseY = (e.clientY - rect.top) / this.scale;

          const box = this.cServices.canvasBoxes[this.selectedBoxIndex];
          box.x = mouseX - this.dragOffsetX;
          box.y = mouseY - this.dragOffsetY;

          this.drawDiagram();
        }
      };

      canvas.onmouseup = () => {
        this.isDragging = false;
        this.selectedBoxIndex = null;
      };
    }
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.stepZoom : this.stepZoom;
    this.scale += delta;
    this.scale = Math.min(Math.max(this.scale, this.minZoom), this.maxZoom);
    this.drawDiagram();
  }

  getAttributeName(obj: CanvasBoxAtributes) {
    const att: VisibilityTypeAttributes = obj.visibility;
    const name = obj.name + "(" + this.getType(obj.type ?? '', obj) + ")";
    switch (att) {
      case VisibilityTypeAttributes.PRIVATE:
        return '-' + name;
      case VisibilityTypeAttributes.PUBLIC:
        return '+' + name
      case VisibilityTypeAttributes.PROTECTED:
        return '#' + name
      case VisibilityTypeAttributes.IMPLEMENTATION:
        return name
    }
  }


  getType(t: TypeAttbutesTypeOrm | string, obj: CanvasBoxAtributes): string {
    console.log(typeof t)

    try {
      if (!this.cServices.canvasBoxes) return "#error b404";
      const targetBoxIndex = this.cServices.canvasBoxes.findIndex(box => box.id === obj.relation?.targetEntity);
      if (targetBoxIndex == -1) return t;
      const box = this.cServices?.canvasBoxes[targetBoxIndex];
      if (box == undefined) return "#error b404";
      return box.entityName;
    } catch (error) {
      return t;
    }
  }

  getClassName(att: VisibilityTypeClass, name: string) {
    switch (att) {
      case VisibilityTypeClass.PRIVATE:
        return '-' + name;
      case VisibilityTypeClass.PUBLIC:
        return '+' + name;
      case VisibilityTypeClass.PROTECTED:
        return '#' + name;
      case VisibilityTypeClass.IMPLEMENTATION:
        return name;
    }
  }

  addEntity(e: AddEntityRes) {
    const p =  this.getRandomLastPosition();
    e.value.x = p.x;
    e.value.y = p.y;
    this.scrollToBox(e.value);
    this.cServices.canvasBoxes.push(e.value);
    e.component.next(true);
    this.drawDiagram();
  }

  showModalAction() {
    //  this.child.showModal();
  }

  getRandomLastPosition() {
    let x = 0;
    let y = 0;
    if (this.cServices.canvasBoxes == undefined || this.cServices.canvasBoxes.length == 0) {
      x = this.DiagramConfig.initial.x;
      y = this.DiagramConfig.initial.y;
      const rPos = { x, y };
      return rPos;
    }
    
    const previousBox = this.cServices.canvasBoxes[this.cServices.canvasBoxes.length - 1];
    const paddingMin = previousBox.width ?? 100;
    const paddingMax = (previousBox.width ?? 150) * 2;
    const px = previousBox.x ?? this.DiagramConfig.initial.x;      const py = previousBox.y ?? this.DiagramConfig.initial.y;

    // Random angle and distance between paddingMin and paddingMax
    const angle = Math.random() * 2 * Math.PI;
    const distance = paddingMin + Math.random() * (paddingMax - paddingMin);

    x = px + Math.cos(angle) * distance + (previousBox.width ?? 0);
    y = py + Math.sin(angle) * distance + (previousBox.height ?? 0);

    // Ensure x and y are within canvas boundaries
    x = Math.max(paddingMin, Math.min(x, this.canvasX - this.DiagramConfig.box.width - paddingMax));
    y = Math.max(paddingMin, Math.min(y, this.canvasY - this.DiagramConfig.box.height - paddingMax));
  

  const rPos = { x, y };
  return rPos;

}




}
