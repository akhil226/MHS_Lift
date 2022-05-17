import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { URLS } from './../../shared/constants/url.constants';
import { AdminSettingsUpdate, AllAdminSettings } from './admin-settings.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {

  constructor(
    private http: HttpClient
  ) { }

  getAdminSettings(): Observable<AllAdminSettings> {
    return this.http.post<AllAdminSettings>(URLS.adminSettingsUrl, {}).pipe(
      filter(({ returnCode }) => returnCode === 0)
    );
  }
  updateAdminSettings(payload: AdminSettingsUpdate): Observable<{ returnCode: number, returnMsg: string }> {
    return this.http.post<{ returnCode: number, returnMsg: string }>(URLS.updateAdminSettings, payload);
  }
}
