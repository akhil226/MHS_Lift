import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { InvoiceComponent } from './invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';

@NgModule({
  declarations: [InvoiceComponent],
  imports: [
    SharedModule,
    InvoiceRoutingModule
  ]
})
export class InvoiceModule { }
