import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Dropdown } from 'src/app/modules/shared/components/multiselect/dropdown.interface';
import { URLS } from '../constants/url.constants';
import {
  EquipmentDetailsRequest,
  EquipmentDetailsResponse, EquipmentListMetadataRequest, EquipmentListMetadataResponse
} from '../interfaces/equipment.interface';
import { EquipmentListItmes, EquipmentListReq, LocationList, LocationMetaData } from './../interfaces/equipment.interface';
import { FileDownloadService } from './file-download.service';

@Injectable({
  providedIn: 'any'
})
export class EquipmentService {

  constructor(
    private http: HttpClient,
    private file: FileDownloadService<EquipmentListReq>
  ) { }

  getEquipmentListMetadata(data: EquipmentListMetadataRequest): Observable<Dropdown> {
    const { getEquipmentListMetadataUrl } = URLS;
    return this.http.post<EquipmentListMetadataResponse>(getEquipmentListMetadataUrl, data).pipe(
      filter(({ returnCode }) => returnCode === 0),
      map(({ equipmentList = [] }) => ({
        multi: false,
        placeholder: 'Enter Serial #/Unit #',
        data: equipmentList.map(({ equipSerialNo, concatSrUnit }) => ({
          key: equipSerialNo, value: concatSrUnit
        }))
      })),
      catchError(() => of({
        multi: false,
        placeholder: 'Enter Serial #/Unit #',
        data: []
      }))
    );
  }

  getEquipmentDetails(data: EquipmentDetailsRequest): Observable<EquipmentDetailsResponse> {
    const { getEquipmentDetailsUrl } = URLS;
    return this.http.post<EquipmentDetailsResponse>(getEquipmentDetailsUrl, data).pipe(
      filter(({ returnCode }) => returnCode === 0),
      map(data1 => {
        return {
          ...data1,
          equipmentServiceHistory: data1.equipmentServiceHistory.map(res => ({ ...res, more: 'MORE' }))
        };
      }
      )
    );
  }
  getEquipmentLists(payload: EquipmentListReq): Observable<EquipmentListItmes> {
    return this.http.post<EquipmentListItmes>(URLS.equipmentListUrl, payload);
  }
  getLocationMetadata(payload: { billingId: string[] }): Observable<LocationList[]> {
    return this.http.post<LocationMetaData>(URLS.locationUrl, payload).pipe(
      map(({ returnCode, locationList }) => returnCode === 0 ? locationList : [])
    );
  }
  downloadEquipmentListReport(payload: EquipmentListReq): void {
    const { equipmentListDownload } = URLS;
    this.file.downloadFile(equipmentListDownload, payload);
  }
}
