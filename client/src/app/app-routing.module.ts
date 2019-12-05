import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShowByCategoryComponent } from './components/show-by-category.component';


const routes: Routes = [
  { path: 'category/:name', component: ShowByCategoryComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
