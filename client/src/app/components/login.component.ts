import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { DBService } from '../db.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private dbSvc: DBService, private fb: FormBuilder, private dialogRef: MatDialogRef<LoginComponent>,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    });
  }

  login() {
    this.dialogRef.close(this.loginForm.value);
    this.dbSvc.loginUser(this.loginForm.value).then(result => {
      if (result == 401)
        return this._snackBar.open('Login failed, please try again.', 'dismiss', {
          duration: 3000,
        });
      this._snackBar.open('You are logged in now.', 'dismiss', {
        duration: 3000,
      });
    }).catch(err => {
      return this._snackBar.open('Login failed, please try again。', 'dismiss', {
        duration: 3000,
      });
    })
  }

}
