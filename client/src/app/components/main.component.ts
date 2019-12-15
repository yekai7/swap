import { Component, OnInit } from '@angular/core';
import { DBService } from '../db.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private dbSvc: DBService, private router: Router) { }

  featured;

  open;
  ngOnInit() {
    this.dbSvc.getFeaturedListing().then(result => {
      console.log(result)
      this.featured = result
    })

    this.dbSvc.getOpenListing().then(result=>{
      console.log(result)
      this.open = result;
    })

  }

  nagivate(id) {
    this.router.navigate(['listing',id])
  }

}
