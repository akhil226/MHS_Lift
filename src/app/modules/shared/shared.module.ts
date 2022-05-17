import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RbLetterAvatarModule } from 'rb-letter-avatar';
import { MaterialModule } from './../material/material.module';
import { AlertComponent } from './components/alert/alert.component';
import { BillingIdSearchComponent } from './components/billing-id-search/billing-id-search.component';
import { MultiselectComponent } from './components/multiselect/multiselect.component';
import { SearchComponent } from './components/search/search.component';
import { TableComponent } from './components/table/table.component';
import { TemplateHeaderDirective } from './components/table/template-header.directive';
import { SortPipe } from './pipes/sort.pipe';
import { LoaderComponent } from './components/loader/loader.component';
import { PaginationComponent } from './components/table/pagination/pagination.component';
import { ScrollToDirective } from './directives/scroll-to.directive';
@NgModule({
  declarations: [
    MultiselectComponent,
    TableComponent,
    SortPipe,
    AlertComponent,
    SearchComponent,
    TemplateHeaderDirective,
    BillingIdSearchComponent,
    LoaderComponent,
    PaginationComponent,
    ScrollToDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    NgMultiSelectDropDownModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MultiselectComponent,
    TableComponent,
    SearchComponent,
    FormsModule,
    TemplateHeaderDirective,
    BillingIdSearchComponent,
    LoaderComponent,
    RbLetterAvatarModule,
    ScrollToDirective
  ],
  providers: []
})
export class SharedModule { }
