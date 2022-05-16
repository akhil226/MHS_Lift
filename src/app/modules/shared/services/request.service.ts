import { filter, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { EquipmentListMetadataRequest, EquipmentListMetadataResponse } from '../interfaces/equipment.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url.constants';
import { ServiceRequest, ServiceRequestResponse, PMRequestModal, EmergencyServiceMetada } from '../interfaces/request.interface';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  selectedEquipmentsToCreateRequest: string[] = [];
  constructor(
    private http: HttpClient
  ) { }
  setSelectedEquipmentsToCreateRequest(data: string[]): void {
    this.selectedEquipmentsToCreateRequest = data;
  }
  getSelectedEquipmentsToCreateRequest(): string[] {
    return this.selectedEquipmentsToCreateRequest;
  }
  getRequestServiceMetadata(payload: EquipmentListMetadataRequest): Observable<EquipmentListMetadataResponse> {
    return this.http.post<EquipmentListMetadataResponse>(URLS.getEquipmentListMetadataUrl, payload);
  }
  createRequestService(payload: ServiceRequest): Observable<ServiceRequestResponse> {
    return this.http.post<ServiceRequestResponse>(URLS.createServiceRequestUrl, payload);
  }
  createPMRequest(payload: PMRequestModal): Observable<ServiceRequestResponse> {
    return this.http.post<ServiceRequestResponse>(URLS.createPMRequestUrl, payload);
  }
  getEmergencyServiceMetadata(): Observable<string> {
    return this.http.post<EmergencyServiceMetada>(URLS.emergencyServiceMetadata, { billingId: [] }).pipe(
      filter(({ returnCode }) => returnCode === 0),
      map(({ metadata }) => metadata?.[0]?.valueField || '')
    );
  }
}
