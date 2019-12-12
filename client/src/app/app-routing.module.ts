import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShowByCategoryComponent } from './components/show-by-category.component';
import { ListComponent } from './components/list.component';
import { DBService } from './db.service';
import { MatchListingComponent } from './components/match-listing.component';
import { MatchComponent } from './components/match.component';
import { ListingDetailComponent } from './components/listing-detail.component';


const routes: Routes = [
  { path: 'category/:name', component: ShowByCategoryComponent },
  { path: 'list', component: ListComponent, canActivate: [DBService] },
  { path: 'listings', component: MatchListingComponent, canActivate: [DBService] },
  { path: 'matched-listings/:id', component: MatchComponent, canActivate: [DBService] },
  { path: 'listing/:id', component: ListingDetailComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
