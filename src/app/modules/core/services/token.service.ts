import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { RefreshToken } from '../../login/login.interface';
import { URLS } from '../../shared/constants/url.constants';
import { UserService } from '../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(
    private http: HttpClient,
    private user: UserService
  ) { }
  private _updateUserToken(refreshToken: string, accessToken: string): void {
    const userDetails = this.user.getUserDetails();
    if (userDetails) {
      userDetails.accessToken = accessToken;
      userDetails.refreshToken = refreshToken;
      this.user.setuserDetails(userDetails);
    }
  }
  refreshAccessToken(): Observable<string> {
    const oldRefreshToken = this.user.getUserDetails()?.refreshToken || '';
    return this.http.post<RefreshToken>(URLS.refreshToken, { refreshToken: oldRefreshToken }).pipe(
      tap(({ refreshToken, accessToken }) => this._updateUserToken(refreshToken, accessToken)),
      map(({ accessToken, returnCode }) => returnCode === 0 ? accessToken : ''),
    );
  }
}
