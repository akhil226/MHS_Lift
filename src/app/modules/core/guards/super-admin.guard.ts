import { AUTHKEY } from './../../shared/constants/auth.constant';
import { UserService } from './../../shared/services/user.service';
import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(
    private user: UserService
  ) { }
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userData = this.user.getUserDetails();
    const isSuperAdmin = !!userData && userData.accessToken && userData.userType === AUTHKEY.ADMIN && userData.superUser === AUTHKEY.SUPER;
    return !!isSuperAdmin;
  }
}
