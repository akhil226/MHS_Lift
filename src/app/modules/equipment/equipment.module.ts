import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { EquipmentDetailsComponent } from './equipment-details/equipment-details.component';
import { EquipmentRoutingModule } from './equipment-routing.module';
import { EquipmentsComponent } from './equipments.component';
import { ServiceHistoryComponent } from './service-history/service-history.component';


@NgModule({
  declarations: [EquipmentsComponent, EquipmentDetailsComponent, ServiceHistoryComponent],
  imports: [
    EquipmentRoutingModule,
    SharedModule
  ]
})
export class EquipmentModule { }
