import { NgModule } from "@angular/core";
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

const MODULE = [
    MatInputModule, MatToolbarModule, MatButtonModule,
    MatFormFieldModule,
    MatIconModule, MatDialogModule,
    MatSelectModule,
    MatMenuModule, MatCheckboxModule
]

@NgModule({
    imports: MODULE,
    exports: MODULE
})


export class MaterialModule {

}