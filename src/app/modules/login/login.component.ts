import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { fromEvent, Observable, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AUTHKEY } from './../shared/constants/auth.constant';
import { NotificationService } from './../shared/services/notification.service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { UserDetails,LoginData } from './login.interface';
import { LoginService } from './login.service';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
type RememberMe = { isEnabled: boolean, email: string };
const REMEMBERME_KEY = 'rememberMe';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  uiVersion=environment.uiVersion;
  @ViewChild('eye', { static: true }) el: ElementRef | undefined;
  showPassword: 'text' | 'password' = 'password';
  rememberMe = new FormControl(false);
  public loader = false;
  private mouseDown$: Observable<any> | undefined;
  private mouseUp$: Observable<any> | undefined;
  private unsubscribe = new Subject<boolean>();
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private loginService: LoginService,
    private notification: NotificationService
  ) {
    this.loginForm = this.formBuilder.group({
      param1: ['', Validators.required],
      param2: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setEmailAndRememberMeField();
    this.mouseDown$ = fromEvent(this.el?.nativeElement, 'mousedown').pipe(tap(() => this.showPassword = 'text'));
    this.mouseUp$ = fromEvent(this.el?.nativeElement, 'mouseup').pipe(tap(() => this.showPassword = 'password'));
    fromEvent(this.el?.nativeElement, 'click').pipe(
      switchMap(() => (this.mouseDown$ as Observable<any>).pipe(
        takeUntil(this.mouseUp$ as Observable<any>)
      )),
      takeUntil(this.unsubscribe)
    ).subscribe();
  }
  private setEmailAndRememberMeField(): void {
    const { email, isEnabled } = this.getRememberME();
    this.loginForm.get('param1')?.setValue(email);
    this.rememberMe.setValue(isEnabled);
  }
  private _showResetPassword(response: UserDetails): Observable<any> {
    const dialogRef = this.dialog.open(ResetPasswordComponent, {
      width: '1200px',
      disableClose: true,
      data: response
    });
    return dialogRef.afterClosed();
  }
  showForgotPasswordPopup(): Observable<any> {
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '1200px',
      disableClose: true
    });
    return dialogRef.afterClosed();
  }
  login(): void { 
    if (this.loginForm.valid) {
      this.loader = true;
      const loginData = { ...this.loginForm.value, platform: 'WEB' ,uiVersion: environment.uiVersion};
      this.loginService.login(loginData).pipe(
        finalize(() => this.loader = false)
      ).subscribe((response) => {
        if (response.returnCode === 0) {
          const { param1: email } = this.loginForm.value;
          const rememberMe: RememberMe = this.rememberMe.value ?
            { email, isEnabled: true } : { email: '', isEnabled: false };
          this.setRememberME(rememberMe);
          const { superUser, userType, resetPassword } = response;
          const isAdmin = userType === AUTHKEY.ADMIN;
          const isSuperAdmin = isAdmin && superUser === AUTHKEY.SUPER;
          if (resetPassword === 'A') {
            this._showResetPassword(response).subscribe(data => {
              if (data) {
                this.loginForm.reset();
              }
            });
          } else if (isSuperAdmin) {
            this.router.navigateByUrl('/admin');
          } else if (isAdmin) {
            this.router.navigateByUrl('/customers');
          } else {
            this.router.navigateByUrl('/dashboard');
          }
        } else {
          this.notification.showNotification(response.returnMsg);
        }
      });
    }
  }
  forgotPassword(): void {
  }
  onEyeClick(): void {
    this.mouseDown$?.pipe(
      takeUntil(this.mouseUp$ || this.unsubscribe)
    ).subscribe();
  }
  private setRememberME(value: RememberMe): void {
    const stringifiedData = JSON.stringify(value);
    localStorage.setItem(REMEMBERME_KEY, stringifiedData);
  }
  private getRememberME(): RememberMe {
    const data = localStorage.getItem('rememberMe');
    if (data) {
      const { email = '', isEnabled = false }: RememberMe = JSON.parse(data);
      return { email, isEnabled };
    }
    return { email: '', isEnabled: false };
  }
  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }
}
