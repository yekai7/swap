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

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<RegisterComponent>, @Inject(MAT_DIALOG_DATA) data,
    private dbSvc: DBService) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    });
  }

  register() {
    this.dialogRef.close(this.registerForm.value);
    this.dbSvc.registerUser(this.registerForm.value).then(result => {
      console.log(result);
      if (result == 409)
        return alert('Email already taken, please login.')
      if (result)
        return alert(`Registered! Welcome ${this.registerForm.value.name}`)
      
      alert('Registration failed, please try again.')
    }).catch(err => {
      console.log(err)
    })

  }

}
