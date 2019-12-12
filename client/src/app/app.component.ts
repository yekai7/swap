import { MatSnackBar } from '@angular/material/snack-bar';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DBService } from './db.service';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private dialog: MatDialog, private dbSvc: DBService, private cookieSvc: CookieService,
    private router: Router, private _snackBar: MatSnackBar) { }

  loginStatus$: Subscription;
  showLogin = true;
  userDetails$: Subscription;
  user;
  avatarUrl;
  name;
  menu;
  searchBy = 'listing';
  searchResult: any = [];

  subMenu: any = [];

  ngOnInit() {
    this.dbSvc.getCategory().then(result => {
      this.menu = result
    })

    if (this.cookieSvc.get('token')) {
      this.showLogin = false;
      this.avatarUrl = JSON.parse(this.cookieSvc.get('userDetail'))['avatar']
      this.name = JSON.parse(this.cookieSvc.get('userDetail'))['name']
    }

    this.loginStatus$ = this.dbSvc.loginStatus$.subscribe(
      v => { this.showLogin = v; }
    )

    this.userDetails$ = this.dbSvc.userDetails$.subscribe(
      v => {
        this.avatarUrl = JSON.parse(v)['avatar']
        this.name = JSON.parse(v)['name']
      }
    )
  }
  loadSubMenu(name) {
    for (let i=0; i< this.menu.length; i++){
      if (this.menu[i].name == name){
        return this.subMenu = this.menu[i].subCategories
      }
    }
  }

  ngOnDestroy() {
    this.loginStatus$.unsubscribe();
    this.userDetails$.unsubscribe();
  }

  search(searchTerm) {
    searchTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    if (this.searchBy == 'listing') {
      this.dbSvc.getListingByTitle(searchTerm)
        .then(result => {
          this.searchResult = result;
          this.searchResult = this.searchResult.slice(0, 5);
        })
        .catch(err => {
          // console.log(err);
        })
    } else {
      this.dbSvc.getListingByCategory(searchTerm, true)
        .then(result => {
          this.searchResult = result;
          this.searchResult = this.searchResult.slice(0, 5);
        })
        .catch(err => {
          // console.log(err)
        })
    }
  }

  navigate(id) {
    this.router.navigate(['/listing', id])
  }

  openDialog(method: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    if (method == 'login')
      return this.dialog.open(LoginComponent, dialogConfig);
    return this.dialog.open(RegisterComponent, dialogConfig);
  }

  logout() {
    this.showLogin = true;
    this.avatarUrl = ''
    this.user = '';
    this.name = '';
    this.cookieSvc.deleteAll();
    this.router.navigate(['/'])
  }
}
