import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DBService } from '../db.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @ViewChild('imageFile', { static: false })
  imageFile: ElementRef;

  constructor(private cookSvc: CookieService, private dbSvc: DBService) { }

  userDetail;

  ngOnInit() {
    this.userDetail = JSON.parse(this.cookSvc.get('userDetail'))
    console.log(this.userDetail)
  }

  processForm(value){
    let name = value.name
    if (!name){
      name = this.userDetail.name;
    }
    this.dbSvc.updateUserInfo(name, this.imageFile).then(result=>{
      console.log("returend result", result)
      this.userDetail.avatar = result;
    }).catch(err=>{
      console.log("err is",err)
    })
  }
}