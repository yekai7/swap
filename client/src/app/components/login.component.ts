import { User, Product } from './../model';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }
  a: User = {
    name: 'yasd', email: 'asd', products: [{ name: 'asd', listed: true }]
  };

  ngOnInit() {

  }

}
