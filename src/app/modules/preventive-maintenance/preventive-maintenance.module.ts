import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { PreventiveMaintenanceRoutingModule } from './preventive-maintenance-routing.module';
import { PreventiveMaintenanceComponent } from './preventive-maintenance.component';



@NgModule({
  declarations: [PreventiveMaintenanceComponent],
  imports: [
    SharedModule,
    PreventiveMaintenanceRoutingModule
  ]
})
export class PreventiveMaintenanceModule { }
