import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DBService } from '../db.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @ViewChild('imageFile', { static: false })
  imageFile: ElementRef;

  userDetails$: Subscription;

  constructor(private cookSvc: CookieService, private dbSvc: DBService) { }

  user;

  ngOnInit() {
    this.user = JSON.parse(this.cookSvc.get('userDetail'))
    this.userDetails$ = this.dbSvc.userDetails$.subscribe(
      v => {
        this.user = JSON.parse(v);
        console.log("asfhasjhdj", this.user)
      }
    )
  }

  processForm(value) {
    let name = value.name
    if (!name) {
      return false;
    }
    this.dbSvc.updateUserInfo(name, this.user.email).then(result => {
      console.log("returend result", result)
    }).catch(err => {
      console.log("erdddr is", err)
    })
  }

  updateAvatar() {
    this.dbSvc.updateAvatar(this.imageFile, this.user.email).then(result => {
      console.log(result)
    })
  }
}