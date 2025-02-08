import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap';
import { Subject } from 'rxjs';
import { CanvasBox, VisibilityTypeClass } from '../../../../../common/Entity/CanvasBox';
import { VisibilityTypeAttributes } from '../../../../../common/Entity/CanvasBoxAtributes';
import { TypeAttbutesTypeOrm } from '../../../../../common/Entity/TypeAttributesTypeOrm';
export type AddEntityRes = { value: CanvasBox, component: any }
@Component({
  selector: 'app-create-entity',
  templateUrl: './component.html',
  styleUrls: ['./create-entity.component.scss']
})
export class CreateEntityComponent implements OnInit {
  entity!: CanvasBox;
  @Output() add = new EventEmitter<AddEntityRes>();
  @ViewChild('createEntityModal') modalRef = {} as ElementRef;

  modal!: Modal;
  visibilities = Object.values(VisibilityTypeClass);
  constructor() {
    
  }

  ngOnInit() {
    this.entity = {
      id: '',
      entityName: '',
      visibility: VisibilityTypeClass.IMPLEMENTATION,
      stereotype: "",
      x : 0,
      y :0,
      attributes: [
        {
          name: "id",
          type: TypeAttbutesTypeOrm.UUID,
          id: '1',
          visibility: VisibilityTypeAttributes.IMPLEMENTATION,
          isMapped: false,
        },
      ]
    };
  }

  addEntity() {
    const showModal: Subject<boolean> = new Subject();
    showModal.subscribe((v: boolean) => {
      this.closeModal();
      showModal.unsubscribe();
    })
    this.add.emit({ value: this.entity, component: showModal });
    this.entity = {
      id: '',
      entityName: '',
      visibility: VisibilityTypeClass.IMPLEMENTATION
    };
  }

  showModal() {
    const modalElement = this.modalRef.nativeElement;
    if (modalElement) {
      this.modal = new Modal(modalElement);
      this.modal.show();
    }
  }

  closeModal() {
    this.modal.hide();
  }

 
  
}
