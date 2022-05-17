import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';


const materialComponents = [
  MatGridListModule,
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatAutocompleteModule,
  MatChipsModule,
  MatTooltipModule,
  MatRippleModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: [materialComponents],
  exports: [materialComponents],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class MaterialModule { }
