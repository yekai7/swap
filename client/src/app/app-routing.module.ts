import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShowByCategoryComponent } from './components/show-by-category.component';
import { ListComponent } from './components/list.component';
import { DBService } from './db.service';


const routes: Routes = [
  { path: 'category/:name', component: ShowByCategoryComponent },
  { path: 'list', component: ListComponent, canActivate: [DBService] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
