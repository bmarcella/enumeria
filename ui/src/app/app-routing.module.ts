import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsonDiagramComponent } from './json-diagram/json-diagram.component';
import { AIChatComponent } from './ai-chat/ai-chat.component';

const routes: Routes = [
  {
    path: '',
    component: JsonDiagramComponent
  },

  {
    path: 'chat',
    component: AIChatComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
