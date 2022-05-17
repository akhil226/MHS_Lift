import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from '../login.service';
import { NotificationService } from '../../shared/services/notification.service';
import { finalize } from 'rxjs/operators';
import { NOTIFICATION_MSG } from '../../shared/constants/notification.constant';
import { UserDetails, ResetPwdData } from '../login.interface';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  public loader = false;
  constructor(
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private notification: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: UserDetails
  ) {
    this.resetForm = this.formBuilder.group({
      param2: ['', Validators.required],
      param3: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

  }
  invokeResetPwd(): void {
    if (this.resetForm.valid) {
      if (this.resetForm.value.param3 === this.resetForm.value.param2) {
        this.notification.showNotification(NOTIFICATION_MSG.samePassword);
      } else if (this.resetForm.value.param3 === this.resetForm.value.confirmPassword) {
        this.loader = true;
        const resetPwdData: ResetPwdData = { ...this.resetForm.value, param1: this.data.email,
           userCode: this.data.userCode, userType: this.data.userType};
        this.loginService.resetPassword(resetPwdData).pipe(
          finalize(() => this.loader = false)
        ).subscribe((response) => {
          if (response.returnCode === 0) {
            this.dialogRef.close(true);
            this.notification.showNotification(response.returnMsg);
          } else {
            this.notification.showNotification(response.returnMsg);
          }
        });
      }else{
        this.notification.showNotification(NOTIFICATION_MSG.passwordNotMatch);

      }


    }

  }

  closeModel(): void {
    this.onDismiss(false);
  }

  ngOnInit(): void {
  }
  onDismiss(data: boolean): void {
    this.dialogRef.close(data);
  }

}
