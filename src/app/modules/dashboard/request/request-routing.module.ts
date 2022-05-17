import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PmRequestComponent } from './pm-request/pm-request.component';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { DeactivateGuard } from '../../core/guards/deactivate.guard';

const routes: Routes = [
  { path: 'pm-request', canDeactivate: [DeactivateGuard], component: PmRequestComponent },
  { path: 'service-request', canDeactivate: [DeactivateGuard], component: ServiceRequestComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule { }
