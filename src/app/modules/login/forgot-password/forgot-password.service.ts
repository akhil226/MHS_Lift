import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, OperatorFunction, pipe } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { URLS } from './../../shared/constants/url.constants';
import { CryptoService } from './../../shared/services/crypto.service';
import { NotificationService } from './../../shared/services/notification.service';

export interface ForgotPassword {
  otpGen: string | null;
  param1: string;
  param2: string | null;
}
export interface ForgotPasswordRes {
  returnMsg: string;
  returnCode: number;
}

@Injectable({
  providedIn: 'any'
})
export class ForgotPasswordService {
  private forgotAction = (): OperatorFunction<ForgotPasswordRes, number> => {
    return pipe(
      tap(({ returnMsg }) => this.notification.showNotification(returnMsg)),
      filter(({ returnCode }) => returnCode === 0),
      map(({ returnCode }) => returnCode)
    );
  }
  constructor(
    private http: HttpClient,
    private crypto: CryptoService,
    private notification: NotificationService
  ) { }


  forgotPassword(email: string): Observable<number> {
    const param1 = this.crypto.getEncryptedValue(email);
    const payload: ForgotPassword = { otpGen: null, param1, param2: null };
    return this.http.post<ForgotPasswordRes>(URLS.forgotPassword, payload).pipe(this.forgotAction());
  }
  submitOtp(email: string, otpGen: string): Observable<number> {
    const param1 = this.crypto.getEncryptedValue(email);
    const payload: ForgotPassword = { otpGen, param1, param2: null };
    return this.http.post<ForgotPasswordRes>(URLS.submitForgotPasswordOtp, payload).pipe(this.forgotAction());
  }
}
