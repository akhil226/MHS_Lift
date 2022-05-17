import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { SharedModule } from '../shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent, ForgotPasswordComponent],
  imports: [
    LoginRoutingModule,
    SharedModule,
    NgxOtpInputModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class LoginModule { }
