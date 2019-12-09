import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';

@Injectable()
export class DBService {

  constructor(private http: HttpClient, private router: Router, private cookieSvc: CookieService) { }

  loginStatus$ = new Subject<boolean>();
  userDetails$ = new Subject<string>();

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
    if (this.cookieSvc.get('token'))
      return (true)
    return (this.router.parseUrl('/'));
  }

  private url = 'http://localhost:3000';

  loginUser(form): Promise<any> {
    return this.http.post(`${this.url}/login`, form).toPromise()
      .then(result => {
        this.cookieSvc.set('token', result['access_token'], 1);
        this.cookieSvc.set('userDetail', JSON.stringify(result['userDetail'][0]));
        this.userDetails$.next(this.cookieSvc.get('userDetail'))
        this.loginStatus$.next(false)
        return true
      })
      .catch(err => {
        return err.status
      })
  }

  registerUser(form): Promise<any> {
    return this.http.post(`${this.url}/register`, form).toPromise()
      .then(result => {
        this.cookieSvc.set('token', result['access_token'], 1);
        this.cookieSvc.set('userDetail', JSON.stringify(result['userDetail'][0]));
        this.userDetails$.next(this.cookieSvc.get('userDetail'))
        this.loginStatus$.next(false)
        return true
      })
      .catch(err => {
        return err.status
      })
  }

  getListingCategory(): Promise<any> {
    return this.http.get(`${this.url}/categories`).toPromise();
  }

  getListingByCategory(category){
    return this.http.get(`${this.url}/listings/${category}`).toPromise();
  }

  postListing(listing) {
    return this.http.post(`${this.url}/listing`, listing).toPromise();
  }
}
