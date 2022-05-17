import {
  HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/modules/shared/services/user.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(
    private user: UserService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const userDetails = this.user.getUserDetails();
    request = request.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Token': userDetails?.accessToken || ''
      }),
      /** no need to pass usercode and type in any api as it is handled in common */
      body: {
        ...request.body as any,
        userCode: (request.body as any)?.userCode || userDetails?.userCode || '',
        userType: (request.body as any)?.userType || userDetails?.userType || ''
      }
    });
    return next.handle(request);
  }
}
