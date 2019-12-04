import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm:FormGroup;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<RegisterComponent>, @Inject(MAT_DIALOG_DATA) data) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: this.fb.control('', [ Validators.required]),
      name: this.fb.control('', [ Validators.required]),
      password: this.fb.control('', [ Validators.required])
    });
  }

  register() {
    console.log(this.registerForm.value);
    this.dialogRef.close(this.registerForm.value);
  }

}
