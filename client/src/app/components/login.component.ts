import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm:FormGroup;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<LoginComponent>, @Inject(MAT_DIALOG_DATA) data) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: this.fb.control('', [ Validators.required]),
      password: this.fb.control('', [ Validators.required])
    });
  }

  login() {
    console.log(this.loginForm.value);
    this.dialogRef.close(this.loginForm.value);
  }

}
