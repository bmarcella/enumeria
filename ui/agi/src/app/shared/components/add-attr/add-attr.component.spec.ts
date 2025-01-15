import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttrComponent } from './add-attr.component';

describe('AddAttrComponent', () => {
  let component: AddAttrComponent;
  let fixture: ComponentFixture<AddAttrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAttrComponent]
    });
    fixture = TestBed.createComponent(AddAttrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
