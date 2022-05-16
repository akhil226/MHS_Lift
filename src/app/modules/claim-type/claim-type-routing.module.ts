import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimTypeComponent } from './claim-type.component';

const routes: Routes = [{ path: '', component: ClaimTypeComponent }];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ClaimTypeRoutingModule {
  }
