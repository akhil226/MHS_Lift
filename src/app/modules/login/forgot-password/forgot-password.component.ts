import { finalize } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { ForgotPasswordService } from './forgot-password.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  loader = false;
  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 6,
    autofocus: true,
    isPasswordInput: true
  };
  enableOTP = false;
  email = new FormControl('', [Validators.required, Validators.email]);
  otp = '';
  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    private forgotPasswordService: ForgotPasswordService
  ) { }

  ngOnInit(): void {
  }
  submitForgotPassword(): void {
    this.loader = true;
    if (!this.enableOTP) {
      this.forgotPasswordService.forgotPassword(this.email.value).pipe(
        finalize(() => this.loader = false)
      ).subscribe(() => this.enableOTP = true );
    } else {
      this.forgotPasswordService.submitOtp(this.email.value, this.otp).pipe(
        finalize(() => this.loader = false)
      ).subscribe(() => this.closePopup());
    }
  }
  handleOtpChange(value: string[]): void {
    this.otp = value.join('').trim();
  }
  closePopup(): void {
    this.dialogRef.close();
  }
}
