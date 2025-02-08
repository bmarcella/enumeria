import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsonDiagramComponent } from './json-diagram/json-diagram.component';

const routes: Routes = [
  {
    path: '',
    component: JsonDiagramComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
