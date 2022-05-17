import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthActivate } from './../core/guards/auth.guard';
import { LoginComponent } from './login.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthActivate],
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
