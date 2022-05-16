import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DropDownData } from './../components/multiselect/dropdown.interface';
import { URLS } from './../constants/url.constants';
import { KpiReport, KpiReportMetadataRes, KpiRequest } from './../interfaces/kpi.interface';
import { FileDownloadService } from './file-download.service';

@Injectable({
  providedIn: 'any'
})
export class KpiService {

  constructor(
    private http: HttpClient,
    private file: FileDownloadService<KpiRequest>
  ) { }
  fetchKPIReportMetadata(): Observable<DropDownData[]> {
    return this.http.post<KpiReportMetadataRes>(URLS.kpiReportMetaData, { billingId: [] }).pipe(
      map(({ returnCode, metadata }) => returnCode === 0 ?
        metadata.map(({ keyField, valueField }) => ({ key: keyField, value: valueField })) : [])
    );
  }
  fetchKPIReport(payload: KpiRequest): Observable<KpiReport> {
    return this.http.post<KpiReport>(URLS.kpiReportUrl, payload);
  }
  downloadKPIReport(payload: KpiRequest): void {
    const { kpiReportDownload } = URLS;
    this.file.downloadFile(kpiReportDownload, payload);
  }
}
