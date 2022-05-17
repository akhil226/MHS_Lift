import { filter, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from './../shared/constants/url.constants';
import { fleetAssetReq, fleetAssetRequest, fleetAssetSummary, fleetAssetSummaryResp } from '../shared/interfaces/report';
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
  /*getFleetAssetSummary(data: fleetAssetRequest): Observable<fleetAssetSummaryResp> {
    return this.http.post<any>(URLS.getFleetAssetSummary, data).pipe(
      map(({ fleetAssetSummaryList, ...data }) => ({
        ...data, fleetAssetSummaryList: fleetAssetSummaryList.map(({ amountLabor, amountOther,amountParts,amountTax,amountTotal, ...fleetAssetSummary }) => ({
          ...fleetAssetSummary, amountLabor: amountLabor ? `$${amountLabor}` : `-`, amountOther: amountOther ? `$${amountOther}` : `-`,amountParts: amountParts ? `$${amountParts}` : `-`,
          amountTax: amountTax ? `$${amountTax}` : `-`,amountTotal: amountTotal ? `$${amountTotal}` : `-`,
        }))
      })));
  }*/

  downloadFleetAssetSummaryList(payload: any): void{
    const { fleetAssetSummaryReportDownload } = URLS;
    this.file.downloadFile(fleetAssetSummaryReportDownload, payload);
  }


}
