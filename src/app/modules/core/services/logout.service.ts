import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, finalize, tap } from 'rxjs/operators';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { LoaderService } from 'src/app/modules/shared/services/loader.service';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { URLS } from '../../shared/constants/url.constants';
import { UserService } from './../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private loader: LoaderService,
    private user: UserService,
    private notification: NotificationService
  ) { }
  private _invokeLogoutApi(): Observable<{ returnCode: number, returnMsg: string }> {
    this.loader.show();
    return this.http.post<{ returnCode: number, returnMsg: string }>(URLS.logout, { platform: 'WEB' }).pipe(
      //  tap(({ returnMsg }) => this.notification.showNotification(returnMsg)),
      filter(({ returnCode }) => returnCode === 0),
      tap(() => this._clearUserDetailsAndRedirect()),
      finalize(() => this.loader.hide())
    );
  }
  private _clearUserDetailsAndRedirect(): void {
    this.user.clearUserDetails();
    this.router.navigateByUrl('/login');
  }
  logout(sessionExpired = false): void {
    this._invokeLogoutApi().subscribe(() => {
      if (sessionExpired) {
        this.notification.showNotification(NOTIFICATION_MSG.sessionExpired);
      }
    });
  }
}
