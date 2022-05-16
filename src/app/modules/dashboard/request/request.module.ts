import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';
import { RequestRoutingModule } from './request-routing.module';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { PmRequestComponent } from './pm-request/pm-request.component';


@NgModule({
  declarations: [ServiceRequestComponent, PmRequestComponent],
  imports: [
    CommonModule,
    RequestRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class RequestModule { }
