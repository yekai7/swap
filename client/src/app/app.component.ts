
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

  constructor(private dialog: MatDialog, private dbSvc: DBService, private cookieSvc: CookieService, private router: Router) { }

  loginStatus$: Subscription;
  showLogin = true;
  avatar$: Subscription;
  avatarUrl = this.cookieSvc.get('avatar');
  menu;
  searchBy = 'listing';

  ngOnInit() {
    this.dbSvc.getListingCategory().then(result => {
      this.menu = result
    })

    if (this.cookieSvc.get('token')) {
      this.showLogin = false;
    }
    
    this.loginStatus$ = this.dbSvc.loginStatus$.subscribe(
      v => { this.showLogin = v; }
    )

    this.avatar$ = this.dbSvc.avatar$.subscribe(
      v => { this.avatarUrl = v; }
    )
  }

  ngOnDestroy() {
    this.loginStatus$.unsubscribe();
    this.avatar$.unsubscribe();
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
    this.cookieSvc.deleteAll();
    this.router.navigate(['/'])
  }
}
