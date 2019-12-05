
import { Component } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DBService } from './db.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private dialog: MatDialog, private dbSvc:DBService, private cookieSvc: CookieService) { }

  // a = JSON.parse(window.localStorage.getItem('userState'));
  // userState = this.a.subscribe(result=>{
  //   console.log("test") 
  // }) || false;

  // userState = this.dbSvc.isAuthenticated().subscribe(result=>{

  // })
  // userState = JSON.parse(window.localStorage.getItem('userState')) || false
  userState = this.cookieSvc.check('authenticated');

  searchBy = 'name';

  menu = [
    {
      name: "Fashion", subMenu: [
        { name: "Male" }, { name: "Female" }
      ]
    },
    {
      name: "Electronics", subMenu: [
        { name: "Camera"}, {name: "Computers"}
      ]
    }
  ]

  openDialog(method: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    if (method == 'login')
      return this.dialog.open(LoginComponent, dialogConfig);
    return this.dialog.open(RegisterComponent, dialogConfig);
  }

  logout() {
    console.log("LOGOUT")
    return this.cookieSvc.deleteAll();
  }
}
