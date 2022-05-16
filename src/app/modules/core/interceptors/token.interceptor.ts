import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { LogoutService } from './../services/logout.service';
import { TokenService } from './../services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private refreshTokenSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(
    private tokenService: TokenService,
    private logoutService: LogoutService,
    private notification: NotificationService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap((event) => this._handleReponse(event)),
      catchError((error: any) => this._handleError(error, request, next))
    );
  }
  private _handleReponse(event: HttpEvent<any>): void {
    if (event instanceof HttpResponse) {
      switch (event.body?.returnCode) {
        case 400:
        case 401:
        case 402:
          this.isRefreshingToken = false;
          this.logoutService.logout(true);
          break;
        case 500:
          this.notification.showNotification(NOTIFICATION_MSG.apiError);
          break;
      }
    }
  }
  private _handleError(error: any, request: HttpRequest<unknown>, next: HttpHandler): Observable<any> {
    if (error instanceof HttpErrorResponse && error.status === 401 && typeof (error.error) === 'string' &&
      error.error?.toLowerCase().includes('expired')) {
      return this._handleTokenOn401(request, next);
    } else if (error instanceof HttpErrorResponse && error.status === 401 && typeof (error.error) === 'string' &&
      error.error?.toLowerCase().includes('invalid')) {
      this.isRefreshingToken = false;
      this.logoutService.logout(true);
    } else if (error instanceof HttpErrorResponse && error.status === 401 && error.statusText?.toLowerCase().includes('unauthorized')) {
      this.notification.showNotification(NOTIFICATION_MSG.INVALID_CREDENTIAL);
    } else {
      this.notification.showNotification(NOTIFICATION_MSG.apiError);
    }
    return throwError(error);
  }
  private _handleTokenOn401(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.refreshTokenSubject$.next(null);
      return this.tokenService.refreshAccessToken().pipe(
        switchMap((accessToken) => {
          this.isRefreshingToken = false;
          this.refreshTokenSubject$.next(accessToken);
          request = request.clone({ headers: request.headers.set('Access-Token', accessToken) });
          return next.handle(request);
        })
      );
    } else {
      return this.refreshTokenSubject$.pipe(
        filter(token => token != null),
        take(1),
        switchMap((accessToken) => {
          request = request.clone({ headers: request.headers.set('Access-Token', accessToken) });
          return next.handle(request);
        })
      );
    }
  }
}
