import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DBService } from '../db.service';

@Component({
  selector: 'app-match-listing',
  templateUrl: './match-listing.component.html',
  styleUrls: ['./match-listing.component.css']
})
export class MatchListingComponent implements OnInit {

  constructor(private cookieSvc: CookieService, private dbSvc: DBService) { }

  user;
  userListings;
  ngOnInit() {
    this.user = JSON.parse(this.cookieSvc.get('userDetail'))
    this.dbSvc.getUserListing(this.user.email).then(result=>{
      this.userListings = result;
    })
    .catch(err=>{
      console.log(err)
    })
  }

}
