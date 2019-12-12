import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DBService } from '../db.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<RegisterComponent>, private dbSvc: DBService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      name: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required, Validators.minLength(8)])
    });
  }

  register() {
    this.dialogRef.close(this.registerForm.value);
    this.dbSvc.registerUser(this.registerForm.value).then(result => {
      if (result == 409)
        return alert('Email already taken, please login.')
      if (result)
        return this._snackBar.open(`Welcome ${this.registerForm.value.name}`, 'dismiss', {
          duration: 3000,
        });
      alert('Registration failed, please try again.')
    }).catch(err => {
      console.log(err)
    })

  }

}
