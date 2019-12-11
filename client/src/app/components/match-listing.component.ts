import { Component, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DBService } from '../db.service';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-match-listing',
  templateUrl: './match-listing.component.html',
  styleUrls: ['./match-listing.component.css']
})
export class MatchListingComponent implements OnInit {

  constructor(private cookieSvc: CookieService, private dbSvc: DBService, private router: Router) { }

  user;
  fullListings;
  userListings;
  pageCount = [];
  pageNum = 0;
  isClicked = false;

  ngOnInit() {
    this.user = JSON.parse(this.cookieSvc.get('userDetail'))
    this.getListing();
  }

  getListing() {
    this.dbSvc.getUserListing(this.user.email).then(result => {
      this.fullListings = result;
      if (result) {
        this.pageCount = Array(Math.ceil(this.fullListings.length / 5)).fill(0).map((x, i) => i);
        this.pagination(this.pageNum);
      }
    })
      .catch(err => {
        console.log(err)
      })
  }

  delete(listing) {
    this.dbSvc.deleteListing(listing._id)
      .then(result => {
        this.getListing()
      })
      .catch(err => {
        console.log("del err", err)
      })
  }



  pagination(pageNum) {
    this.pageNum = pageNum
    const start = pageNum * 5 || 0
    return this.userListings = this.fullListings.slice(start, (start + 5))
  }

  left() {
    if (this.pageNum == 0) {
      return alert("You are at the first page of listings.")
    }
    this.pageNum--;
    this.pagination(this.pageNum);
  }

  right() {
    if (this.pageNum == (this.pageCount.length-1)) {
      return alert("You are at the last page of listings.")
    }
    this.pageNum++;
    this.pagination(this.pageNum);
  }

  navigate() {
    this.router.navigate(['listing']);
  }

}
