import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private router: Router,
    private user: UserService
  ) { }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const fullPath = segments.reduce((path, currentSegment) => `${path}/${currentSegment.path}`, '');
    const userData = this.user.getUserDetails();
    const isUser = userData && userData.accessToken;
    if (fullPath !== '/login') {
      return !!isUser ? true : this.router.navigateByUrl('/login');
    }
    return !isUser ? true : this.router.navigateByUrl('/dashboard');
  }
}
@Injectable({
  providedIn: 'root'
})
export class AuthActivate implements CanActivate {
  constructor(
    private router: Router,
    private user: UserService
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      const fullPath = state.url;
      const userData = this.user.getUserDetails();
      const isUser = userData && userData.accessToken;
      if (fullPath !== '/login') {
        return !!isUser ? true : this.router.navigateByUrl('/login');
      }
      return !isUser ? true : this.router.navigateByUrl('/dashboard');
  }
}
