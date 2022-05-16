import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { URLS } from '../shared/constants/url.constants';
import { UserService } from '../shared/services/user.service';
import { LogoutService } from './../core/services/logout.service';
import { NOTIFICATION_MSG } from './../shared/constants/notification.constant';
import { CryptoService } from './../shared/services/crypto.service';
import { NotificationService } from './../shared/services/notification.service';
import { LoginData, ResetPwdData, ResetPwdResponse, UserDetails } from './login.interface';

const PASSWORD_PATTERN = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/g;
@Injectable({
  providedIn: 'root'
})
export class LoginService {user: LoginData | null =null


  constructor(
    private http: HttpClient,
    private userService: UserService,
    private crypto: CryptoService,
    @Inject(forwardRef(() => NotificationService)) private notification: NotificationService,
    private logoutService: LogoutService,
  ) { }

  login(data: LoginData): Observable<UserDetails> {
    const { loginUrl } = URLS;
    const { param1, param2, platform,uiVersion} = data;
    
    const encryptedData: LoginData = {
      param1: this.crypto.getEncryptedValue(param1.trim()),
      param2: this.crypto.getEncryptedValue(param2.trim()),
      platform,
      uiVersion:data.uiVersion
    };
    return this.http.post<UserDetails>(loginUrl, encryptedData).pipe(
      tap(userData => userData.returnCode === 0 && userData.resetPassword === 'I' ?
        this.userService.setuserDetails(userData) :
        this.userService.setuserDetails(null)
      )
    );
  }
  private _validatePassword({ param3 }: ResetPwdData): boolean {
    const regex = PASSWORD_PATTERN;
    return regex.test(param3);
  }
  resetPassword(data: ResetPwdData): Observable<ResetPwdResponse> {
    if (this._validatePassword(data)) {
      const { resetPasswordUrl } = URLS;
      const { param1, param2, param3 } = data;
      const encryptedData: ResetPwdData = {
        param1: this.crypto.getEncryptedValue(param1),
        param2: this.crypto.getEncryptedValue(param2),
        param3: this.crypto.getEncryptedValue(param3),
        userCode: data.userCode,
        userType: data.userType
      };
      return this.http.post<ResetPwdResponse>(resetPasswordUrl, encryptedData);
    }
    this.notification.showNotification(NOTIFICATION_MSG.InvalidPasswordPattern);
    return EMPTY;
  }
  logout(): void {
    this.logoutService.logout();
  }
}
