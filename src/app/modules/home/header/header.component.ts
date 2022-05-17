import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { LoginService } from './../../login/login.service';
import { ALERT } from './../../shared/constants/alert.constant';
import { AUTHKEY } from './../../shared/constants/auth.constant';
import { AlertService } from './../../shared/services/alert.service';
import { LoaderService } from './../../shared/services/loader.service';
import { UserService } from './../../shared/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAdmin = false;
  isSuperAdmin = false;
  constructor(
    private user: UserService,
    private router: Router,
    private alert: AlertService,
    public loader: LoaderService,
    private login: LoginService
  ) { }

  ngOnInit(): void {
    const userDetails = this.user.getUserDetails();
    this.isAdmin = userDetails?.userType === AUTHKEY.ADMIN;
    this.isSuperAdmin = this.isAdmin && userDetails?.superUser === AUTHKEY.SUPER;
  }
  logout(): void {
    //  this.user.clearUserDetails();
    const title = ALERT.logoutTitle;
    const content = ALERT.logoutMsg;
    this.alert.show({ title, content }).pipe(
      filter(value => value),
      take(1)
    ).subscribe(() => this._logoutAndRedirect());
  }
  private _logoutAndRedirect(): void {
    this.login.logout();
  }
}
