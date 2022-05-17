import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { AuthGuard } from './modules/core/guards/auth.guard';
const routerOptions: ExtraOptions = {
  useHash: true
};
const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  {
    path: 'login',
    canLoad: [AuthGuard],
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
  },
  /** all other feature modules are child modules of home module */
  {
    path: '',
    canLoad: [AuthGuard],
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
