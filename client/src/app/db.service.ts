import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DBService {

  constructor(private http: HttpClient) { }
}
