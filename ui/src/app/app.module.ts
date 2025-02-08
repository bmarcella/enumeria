import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JsonDiagramComponent } from './json-diagram/json-diagram.component';
import { CreateEntityComponent } from './Modals/create-entity/create-entity.component';
import { AddAttrComponent } from './shared/components/add-attr/add-attr.component';

@NgModule({
  declarations: [
    AppComponent,
    JsonDiagramComponent,
    CreateEntityComponent,
    AddAttrComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule { }
