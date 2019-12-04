import { Component } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private dialog: MatDialog) { }

  openDialog(method:string) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    if (method == 'login')
      return this.dialog.open(LoginComponent, dialogConfig);
    return this.dialog.open(RegisterComponent, dialogConfig);
  }
}
