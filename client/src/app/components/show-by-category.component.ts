import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DBService } from '../db.service';

@Component({
  selector: 'app-show-by-category',
  templateUrl: './show-by-category.component.html',
  styleUrls: ['./show-by-category.component.css']
})
export class ShowByCategoryComponent implements OnInit {

  constructor(private aRoute: ActivatedRoute, private dbSvc: DBService) { }
  listings;
  category;

  ngOnInit() {
    this.aRoute.paramMap.subscribe(params => {
      this.category = params.get('name');
      this.getListing();
    })


  }

  getListing() {
    this.dbSvc.getListingByCategory(this.category).then(result => {
      this.listings = result;
    })
  }

}
