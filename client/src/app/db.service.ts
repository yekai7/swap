import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

@Injectable()
export class DBService {

  constructor(private http: HttpClient, private router: Router) { }

  private token;
  private authenticated = false;

  isAuthenticated() {
    return this.authenticated;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
    if (this.token)
      return (true)
    return (this.router.parseUrl('/'));
  }

  private url = 'http://localhost:3000';

  loginUser(form): Promise<any> {
    return this.http.post(`${this.url}/login`, form).toPromise()
      .then(result => {
        const userData = {
          token: result['access_token'],
          authenticated: true
        }
        window.localStorage.setItem('userState', JSON.stringify(userData))
        return true
      })
      .catch(err => {
        // this.token = '';
        // this.authenticated = false
        return err.status
      })
  }

  registerUser(form): Promise<any> {
    return this.http.post(`${this.url}/register`, form).toPromise()
      .then(result => {
        const userState = {
          token: result['access_token'],
          authenticated: true
        }
        window.localStorage.setItem('testStorage', JSON.stringify(userState))
        return (true)
      })
      .catch(err => {
        return err.status
      })
  }
}
