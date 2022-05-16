import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Dropdown } from 'src/app/modules/shared/components/multiselect/dropdown.interface';
import { URLS } from './../constants/url.constants';
import { ServiceReportReq, ServiceReports } from './../interfaces/service-reports.interface';
import { FileDownloadService } from './file-download.service';

@Injectable({
  providedIn: 'any'
})
export class ServiceDetailsService {

  constructor(
    private http: HttpClient,
    private file: FileDownloadService<ServiceReportReq>
  ) { }

  getServiceReports(): Observable<Dropdown> {
    return this.http.post<ServiceReports>(URLS.serviceReports, { billingId: [] }).pipe(
      filter(({ returnCode }) => returnCode === 0),
      map(({ metadata }) => ({
        multi: false,
        placeholder: 'Select Report',
        allowSearchFilter: false,
        data: (metadata || []).map(({ keyField, valueField }) => ({
          key: keyField, value: valueField
        }))
      })),
      catchError(() => of({
        multi: false,
        placeholder: 'Select Report',
        allowSearchFilter: false,
        data: []
      }))
    );
  }
  downloadServiceReport(payload: ServiceReportReq): void {
    const { serviceReportDownload } = URLS;
    this.file.downloadFile(serviceReportDownload, payload);
  }
}
