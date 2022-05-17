import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { AUTHKEY } from './../../shared/constants/auth.constant';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanLoad {
  constructor(
    private user: UserService
  ) { }
  canLoad(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userData = this.user.getUserDetails();
    const isAdmin = !!userData && userData.accessToken && userData.userType === AUTHKEY.ADMIN;
    return !!isAdmin;
  }
}
@Injectable({
  providedIn: 'root'
})
export class AdminActivate implements CanActivate {
  constructor(
    private user: UserService
  ) { }
  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      const userData = this.user.getUserDetails();
      const isAdmin = !!userData && userData.accessToken && userData.userType === AUTHKEY.ADMIN;
      return !!isAdmin;
  }
}
