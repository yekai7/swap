import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DBService } from '../db.service';

@Component({
  selector: 'app-show-by-category',
  templateUrl: './show-by-category.component.html',
  styleUrls: ['./show-by-category.component.css']
})
export class ShowByCategoryComponent implements OnInit {

  constructor(private aRoute: ActivatedRoute, private dbSvc: DBService, private _snackBar: MatSnackBar,
    private router: Router) { }

  category;
  fullListings;
  pageListing;
  pageCount = [];
  pageNum = 0;

  ngOnInit() {
    this.aRoute.paramMap.subscribe(params => {
      this.category = params.get('name');
      this.getListing(this.category);
    })
  }

  getListing(category) {
    this.dbSvc.getListingByCategory(category).then(result => {
      this.fullListings = result;
      if (result) {
        this.pageCount = Array(Math.ceil(this.fullListings.length / 9)).fill(0).map((x, i) => i);
        this.pagination(this.pageNum);
      }
    })
  }

  navigate(id) {
    this.router.navigate(['listing/', id])
  }

  pagination(pageNum) {
    this.pageNum = pageNum
    const start = pageNum * 9 || 0
    return this.pageListing = this.fullListings.slice(start, (start + 9))

  }
  left() {
    if (this.pageNum == 0) {
      return this._snackBar.open('You have reached the first page.', 'dismiss', {
        duration: 3000,
      });
    }
    this.pageNum--;
    this.pagination(this.pageNum);
  }

  right() {
    if (this.pageNum == (this.pageCount.length - 1)) {
      return this._snackBar.open('You have reached the last page.', 'dismiss', {
        duration: 3000,
      });
    }
    this.pageNum++;
    this.pagination(this.pageNum);
  }
}
