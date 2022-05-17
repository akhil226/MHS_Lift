
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from './../shared/constants/url.constants';
import { fleetAssetReq } from '../shared/interfaces/report';
import { FileDownloadService } from '../shared/services/file-download.service';
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private http: HttpClient,
    private file: FileDownloadService<fleetAssetReq>
  ) { }

  getCurrentMHECost(payload: any): Observable<any> {
    return this.http.post<any>(URLS.getCurrentMHECost, payload);
  }
  getAvoidableSpend(payload: any): Observable<any> {
    return this.http.post<any>(URLS.getAvoidableSpend, payload);
  }
  fleetComposition(payload: any): Observable<any> {
    return this.http.post<any>(URLS.fleetComposition, payload);
  }
  monthlyRentalComparison(payload: any): Observable<any> {
    return this.http.post<any>(URLS.monthlyRentalComparison, payload);
  }
  monthlyServiceComparison(payload: any): Observable<any> {
    return this.http.post<any>(URLS.monthlyServiceComparison, payload);
  }
  spendByClaimType(payload: any): Observable<any> {
    return this.http.post<any>(URLS.spendByClaimType, payload);
  }
  top10AssetTotals(payload: any): Observable<any> {
    return this.http.post<any>(URLS.top10AssetTotals, payload);
  }
  getTopAssetList(payload: any): Observable<any> {
    return this.http.post<any>(URLS.getTopAssetList, payload);
  }
  getFleetAssetSummary(payload: any): Observable<any> {
    return this.http.post<any>(URLS.getFleetAssetSummary, payload);
  }

  getReportPdf(payload:any): void {
    this.file.downloadFile(URLS.reportPdfDonwload, payload);
  }

  downloadFleetAssetSummaryList(payload: any): void{
    const { fleetAssetSummaryReportDownload } = URLS;
    this.file.downloadFile(fleetAssetSummaryReportDownload, payload);
  }


}
