import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PMWorkOrderListRequest, PMWorkOrderListResponse } from '../interfaces/pmWorkOrder.interface';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url.constants';

@Injectable({
  providedIn: 'root'
})
export class PmWorkOrderService {
  constructor(
    private http: HttpClient
  ) { }

 getPMWorkOrderList(data: PMWorkOrderListRequest): Observable<PMWorkOrderListResponse> {
    const { getPMWorkOrderListUrl } = URLS;
    return this.http.post<PMWorkOrderListResponse>(getPMWorkOrderListUrl, data);
  }
}
