import { NgModule } from "@angular/core";
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';


const MODULE = [
    MatInputModule, MatToolbarModule, MatButtonModule,
    MatButtonToggleModule, MatRadioModule, MatFormFieldModule,
    MatDatepickerModule, MatIconModule,
    MatSelectModule, MatTableModule, MatStepperModule
]

@NgModule({
    imports: MODULE,
    exports: MODULE
})


export class MaterialModule {

}