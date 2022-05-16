import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminsComponent } from './admins/admins.component';
import { CustomersComponent } from './customers/customers.component';
import { AddCustomersComponent } from './customers/add-customers/add-customers.component';
import { ShippingIdSelectionComponent } from './customers/shipping-id-selection/shipping-id-selection.component';
import { AddAdminComponent } from './admins/add-admin/add-admin.component';


@NgModule({
  declarations: [
    AdminsComponent,
    CustomersComponent,
    AdminSettingsComponent,
    AddCustomersComponent,
    ShippingIdSelectionComponent,
    AddAdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule
  ]
})
export class AdminModule { }
