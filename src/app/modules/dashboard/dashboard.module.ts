import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { WorkOrderStatusGraphComponent } from './work-order-status-graph/work-order-status-graph.component';
import { ExecutiveSummaryGraphComponent } from './executive-summary-graph/executive-summary-graph.component';
import { KpiFilterComponent } from './kpi-filter/kpi-filter.component';


@NgModule({
  declarations: [DashboardComponent, WorkOrderStatusGraphComponent, ExecutiveSummaryGraphComponent, KpiFilterComponent],
  imports: [
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule { }
