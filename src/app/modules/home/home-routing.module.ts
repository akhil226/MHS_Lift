import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthActivate } from '../core/guards/auth.guard';
import { AdminActivate, AdminGuard } from './../core/guards/admin.guard';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '', canActivate: [AuthActivate], component: HomeComponent, children: [
      {
        path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/request/request.module').then(m => m.RequestModule)
      },
      {
        path: 'equipments', loadChildren: () => import('../equipment/equipment.module').then(m => m.EquipmentModule)
      },
      {
        path: 'work-orders', loadChildren: () => import('../work-order/work-order.module').then(m => m.WorkOrderModule)
      },
      {
        path: 'preventive-maintenance',
        loadChildren: () => import('../preventive-maintenance/preventive-maintenance.module').then(m => m.PreventiveMaintenanceModule)
      },
      {
        path: 'report', loadChildren: () => import('../report/report.module').then(m => m.ReportModule)
      },
      {path: 'claim-type', loadChildren: () => import('../claim-type/claim-type.module').then(m => m.ClaimTypeModule) },

      {
        path: 'invoices', loadChildren: () => import('../invoice/invoice.module').then(m => m.InvoiceModule)
      },
      {
        path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: '',
        canLoad: [AdminGuard],
        canActivate: [AdminActivate],
        loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
