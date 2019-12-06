
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DBService } from './db.service';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{

  constructor(private dialog: MatDialog, private dbSvc:DBService, private cookieSvc: CookieService) { }

  loginStatus$: Subscription;
  showLogin = true;

  ngOnInit() {
    if (this.cookieSvc.get('token')){
      this.showLogin = false
    }
    this.loginStatus$ = this.dbSvc.loginStatus$.subscribe(
      v => {
        this.showLogin = v;
        console.log("SHOULD DP IS ",this.showLogin)
      }
    )
  }

  ngOnDestroy() {
    this.loginStatus$.unsubscribe();
  }

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
    this.showLogin = true;
    return this.cookieSvc.deleteAll();
  }
}
