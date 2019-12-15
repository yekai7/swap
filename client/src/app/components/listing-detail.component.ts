import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DBService } from '../db.service';

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.css']
})
export class ListingDetailComponent implements OnInit {

  constructor(private aRoute: ActivatedRoute, private dbSvc: DBService) { }

  listing: any = [];

  ngOnInit() {
    this.aRoute.paramMap.subscribe(v => {
      this.dbSvc.getListingDetail(v.get('id')).then(result => {
        this.listing = result;
      }).catch(err => { console.log(err) })
    })


    console.log(this.listing)
  }

}
