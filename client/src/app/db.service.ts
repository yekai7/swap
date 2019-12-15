import { Injectable, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';

@Injectable()
export class DBService {

  constructor(private http: HttpClient, private router: Router, private cookieSvc: CookieService) { }

  loginStatus$ = new Subject<boolean>();
  userDetails$ = new Subject<string>();
  token = this.cookieSvc.get('token');

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
    if (this.cookieSvc.get('token')) {
      return (true)
    }
    return (this.router.parseUrl('/'));
  }

  private url = 'http://localhost:3000'
  // private url = 'http://206.189.84.235:3000'
  // private url = 'https://206.189.84.235:443'
  // private url = 'https://swapit-server.herokuapp.com';

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


  updateUserInfo(name, email) {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const data = new HttpParams()
      .set('name', name)
      .set('email', email)
    return this.http.put(`${this.url}/user`, data.toString(), { headers }).toPromise()
      .then(result => {
        console.log("truend to svc", result);
        const a = JSON.parse(this.cookieSvc.get('userDetail'))
        a.name = result['name'];
        this.cookieSvc.set('userDetail', JSON.stringify(a), 1)
        this.userDetails$.next(this.cookieSvc.get('userDetail'))
        return true;
      })
      .catch(err => {
        return false;
      });
  }

  updateAvatar(images, email) {
    const formData = new FormData();
    formData.set('avatar', images.nativeElement.files[0])
    formData.set('email', email)
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.post(`${this.url}/user/avatar`, formData, { headers }).toPromise()
      .then(result => {
        this.cookieSvc.set('userDetail', JSON.stringify(result[0]), 1);
        this.userDetails$.next(this.cookieSvc.get('userDetail'))
        return result;
      })
      .catch(err => {
        console.log(err)
      })
  }

  getCategory(): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.get(`${this.url}/categories`).toPromise()
  }

  getListingByCategory(category, unwind = false) {
    const params = new HttpParams().set('unwind', unwind.toString());
    return this.http.get(`${this.url}/listings/category/${category}`, { params }).toPromise();
  }

  getListingByTitle(title) {
    return this.http.get(`${this.url}/listings/title/${title}`).toPromise();
  }

  postListing(listing) {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
    const formData = new FormData()
    for (let i = 0; i < listing.listingImages.length; i++) {
      formData.append('listingImages', listing.listingImages[i]);
    }
    formData.append('listing', JSON.stringify(listing))
    // console.log(listing)
    return this.http.post(`${this.url}/listing`, formData, { headers }).toPromise();
  }

  getUserListing(user) {
    return this.http.get(`${this.url}/${user}/listings`).toPromise();
  }

  deleteListing(id) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    const params = new HttpParams().set('id', id);
    return this.http.delete(`${this.url}/listing`, { headers, params }).toPromise();
  }

  matchListing(id) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get(`${this.url}/matchListing/${id}`, { headers }).toPromise();
  }

  getListingDetail(id) {
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.url}/listing`, { params }).toPromise();
  }

  getFeaturedListing() {
    return this.http.get(`${this.url}/listing/featured`).toPromise();
  }

  getOpenListing(){
    return this.http.get(`${this.url}/listing/open`).toPromise();
  }
}
