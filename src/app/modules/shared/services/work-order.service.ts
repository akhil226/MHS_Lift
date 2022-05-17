import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  WorkOrderListRequest, WorkOrderListResponse, WorkOrderStatusGraphRequest,
  WorkOrderStatusGraphResponse, WorkOrderStatusMetadata
} from '../interfaces/workOrder.interface';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url.constants';

type WoSelectedMetaData = { woId: string, woType: number, location: string[] };
@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private woSelectedMetadata: WoSelectedMetaData | null = null;
  constructor(
    private http: HttpClient
  ) { }

  getWorkOrderList(data: WorkOrderListRequest): Observable<WorkOrderListResponse> {
    return this.http.post<WorkOrderListResponse>(URLS.getWorkOrderListUrl, data);
  }

  getWorkOrderStatusGraph(data: WorkOrderStatusGraphRequest): Observable<WorkOrderStatusGraphResponse> {
    return this.http.post<WorkOrderStatusGraphResponse>(URLS.getWoStatusGraphUrl, data);
  }

  getWorkOrderStatusMetadata(data: any): Observable<WorkOrderStatusMetadata> {
    return this.http.post<WorkOrderStatusMetadata>(URLS.getWoStatusMetadataUrl, data);
  }
  setWoSelectedMetadata(data: WoSelectedMetaData | null): void {
    this.woSelectedMetadata = data;
  }
  getWoSelectedMetadata(): WoSelectedMetaData | null {
    return this.woSelectedMetadata;
  }
}
