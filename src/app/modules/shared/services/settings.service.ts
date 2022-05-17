import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url.constants';
import { UpdateUserPrevAccessRequest, UpdateUserPrevAccessResponse } from '../interfaces/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
    private http: HttpClient
  ) { }

  updateUserAccessPrivilages(data: UpdateUserPrevAccessRequest): Observable<UpdateUserPrevAccessResponse> {
    const { updateUserPrivilageAccessUrl } = URLS;
    return this.http.post<UpdateUserPrevAccessResponse>(updateUserPrivilageAccessUrl, data);
  }
}
