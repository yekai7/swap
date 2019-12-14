import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DBService } from './db.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login.component';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RegisterComponent } from './components/register.component';
import { ShowByCategoryComponent } from './components/show-by-category.component';
import { CookieService } from 'ngx-cookie-service';
import { ListComponent } from './components/list.component';
import { MatchListingComponent } from './components/match-listing.component';
import { MatchComponent } from './components/match.component';
import { ListingDetailComponent } from './components/listing-detail.component';
import { MainComponent } from './components/main.component';
import { UserComponent } from './components/user.component';
import { SliderModule } from 'angular-image-slider';
import { NgImageSliderModule } from 'ng-image-slider';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ShowByCategoryComponent,
    ListComponent,
    MatchListingComponent,
    MatchComponent,
    ListingDetailComponent,
    MainComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, BrowserAnimationsModule,
    FlexLayoutModule, MaterialModule,
    ReactiveFormsModule, FormsModule,
    SliderModule, NgImageSliderModule
  ],
  providers: [DBService, CookieService],
  bootstrap: [AppComponent],
  entryComponents: [LoginComponent, RegisterComponent]
})
export class AppModule { }
