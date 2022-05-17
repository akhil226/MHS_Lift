import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { WorkOrderRoutingModule } from './work-order-routing.module';
import { WorkOrderComponent } from './work-order.component';

@NgModule({
  declarations: [WorkOrderComponent],
  imports: [
    SharedModule,
    WorkOrderRoutingModule
  ]
})
export class WorkOrderModule { }
