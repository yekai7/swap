import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';

@Injectable()
export class DBService {

  constructor(private http: HttpClient, private router: Router, private cookieSvc: CookieService) { }

  loginStatus$ = new Subject<boolean>();
  userDetails$ = new Subject<string>();


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
    if (this.cookieSvc.get('token')) {
      console.log("TRUE path")
      return (true)
    }
    console.log("FALSE PATH")
    return (this.router.parseUrl('/'));
  }

  private url = 'http://localhost:3000';

  loginUser(form): Promise<any> {
    return this.http.post(`${this.url}/login`, form).toPromise()
      .then(result => {
        this.cookieSvc.set('token', result['access_token'], 1);
        this.cookieSvc.set('userDetail', JSON.stringify(result['userDetail'][0]), 1);
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
        this.cookieSvc.set('userDetail', JSON.stringify(result['userDetail'][0]), 1);
        this.userDetails$.next(this.cookieSvc.get('userDetail'))
        this.loginStatus$.next(false)
        return true
      })
      .catch(err => {
        return err.status
      })
  }

  getCategory(): Promise<any> {
    return this.http.get(`${this.url}/categories`).toPromise();
  }

  getListingByCategory(category, unwind = false) {
    const params = new HttpParams().set('unwind', unwind.toString());
    return this.http.get(`${this.url}/listings/category/${category}`, { params }).toPromise();
  }

  getListingByTitle(title) {
    return this.http.get(`${this.url}/listings/title/${title}`).toPromise();
  }

  postListing(listing) {
    return this.http.post(`${this.url}/listing`, listing).toPromise();
  }

  getUserListing(user) {
    return this.http.get(`${this.url}/${user}/listings`).toPromise();
  }

  deleteListing(id) {
    const token = this.cookieSvc.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('id', id);
    return this.http.delete(`${this.url}/listing`, { headers, params }).toPromise();
  }

  matchListing(id) {
    const token = this.cookieSvc.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.url}/matchListing/${id}`, { headers }).toPromise();
  }
}
