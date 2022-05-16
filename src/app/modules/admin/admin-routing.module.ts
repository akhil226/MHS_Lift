import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeactivateGuard } from './../core/guards/deactivate.guard';
import { SuperAdminGuard } from './../core/guards/super-admin.guard';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AddAdminComponent } from './admins/add-admin/add-admin.component';
import { AdminsComponent } from './admins/admins.component';
import { AddCustomersComponent } from './customers/add-customers/add-customers.component';
import { CustomersComponent } from './customers/customers.component';

const routes: Routes = [
  { path: 'admin', canActivate: [SuperAdminGuard], component: AdminsComponent },
  { path: 'admin/add', canActivate: [SuperAdminGuard], canDeactivate: [DeactivateGuard], component: AddAdminComponent },
  { path: 'admin/edit/:id', canActivate: [SuperAdminGuard], canDeactivate: [DeactivateGuard], component: AddAdminComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'customers/add', canDeactivate: [DeactivateGuard], component: AddCustomersComponent },
  { path: 'customers/edit/:id', canDeactivate: [DeactivateGuard], component: AddCustomersComponent },
  { path: 'admin-settings', canDeactivate: [DeactivateGuard], component: AdminSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
