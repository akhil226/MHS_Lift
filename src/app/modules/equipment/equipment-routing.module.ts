import { EquipmentDetailsComponent } from './equipment-details/equipment-details.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipmentsComponent } from './equipments.component';

const routes: Routes = [
  { path: '', component: EquipmentsComponent },
  { path: ':id', component: EquipmentDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipmentRoutingModule { }
