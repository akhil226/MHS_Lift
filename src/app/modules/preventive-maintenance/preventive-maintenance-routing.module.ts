import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreventiveMaintenanceComponent } from './preventive-maintenance.component';

const routes: Routes = [
  { path: '', component: PreventiveMaintenanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreventiveMaintenanceRoutingModule { }
