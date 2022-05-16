import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimTypeRoutingModule } from './claim-type-routing.module';
import { ClaimTypeComponent } from './claim-type.component';
import { SharedModule } from '../shared/shared.module';
import { ServicehistoryComponent } from './servicehistory/servicehistory.component';

@NgModule({
  declarations: [
    ClaimTypeComponent,
    ServicehistoryComponent
  ],
  imports: [
    CommonModule,
    ClaimTypeRoutingModule,
    SharedModule
  ]
})
export class ClaimTypeModule { }
