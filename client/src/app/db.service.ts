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
    return (this.router.parseUrl('login'));
  }

  private url = 'http://localhost:3000';

  loginUser(form):Promise<any>{
    return this.http.post(`${this.url}/login`, form).toPromise()
      .then(result=>{
        this.token = result['access_token'];
        this.authenticated = true
        return true
      })
      .catch(err=>{
        this.token = '';
        this.authenticated = false

        return false
      })
  }

  registerUser(form): Promise<any> {
    return this.http.post(`${this.url}/register`, form).toPromise()
      .then(result => {
        return (true)
      })
      .catch(err => {
        return err.status
      })
  }
}
