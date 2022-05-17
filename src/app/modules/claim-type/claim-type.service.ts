import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Dropdown } from '../shared/components/multiselect/dropdown.interface';
import { URLS } from '../shared/constants/url.constants';
import {  getClaimTypeMetadataRequest, getClaimTypeMetadataResponse } from '../shared/interfaces/claim-type.interface';

@Injectable({
  providedIn: 'root'
})
export class ClaimTypeService {
  selectedShipIdToCreateRequest: string[] = [];
  constructor(    private http: HttpClient) { }
  getClaimTypeList(payload: any): Observable<any> {
    return this.http.post<any>(URLS.getClaimTypeList, payload);
  }
  getAllBillingId(payload: any): Observable<any> {
    console.warn(payload);

    return this.http.post<any>(URLS.getBillingId, payload);
  }

  getClaimType(payload: any): Observable<any> {
    return this.http.post<any>(URLS.getClaimTypeMetadataUrl, payload);
  }
  saveWOClaimType(payload: any): Observable<any> {
    return this.http.post<any>(URLS.saveWOClaimType, payload);
  }
  getSelectedShipIdToCreateRequest(): string[] {
    return this.selectedShipIdToCreateRequest;
  }
  setSelectedShipIdToCreateRequest(data: string[]): void {
    this.selectedShipIdToCreateRequest = data;
  }
}
