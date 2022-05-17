import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InvoiceListRequest, InvoiceListResponse, DepartmentMetaData } from '../interfaces/invoice.interface';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url.constants'
import { ExecutiveSummaryRequest, ExecutiveSummaryResponse } from '../interfaces/executiveSummary.interface';
@Injectable({
  providedIn: 'root'
})
export class ExecutiveSummaryService {
  public executiveSummary: ExecutiveSummaryResponse | undefined;
  constructor(
    private http: HttpClient
  ) { }

 getExecutiveSummary(data: ExecutiveSummaryRequest |undefined): Observable<ExecutiveSummaryResponse> {
    return this.http.post<ExecutiveSummaryResponse>(URLS.getExecutiveSummaryUrl, data);
  }
}