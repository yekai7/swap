import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DBService } from '../db.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  constructor(private aRoute: ActivatedRoute, private dbSvc: DBService) { }

  listings:any =[];
  yourListing:any = [];
  ngOnInit() {
    this.dbSvc.matchListing(this.aRoute.snapshot.paramMap.get('id')).then(result=>{
      this.listings = result['result'];
      this.yourListing = result['searcher']
    })
  }

}
