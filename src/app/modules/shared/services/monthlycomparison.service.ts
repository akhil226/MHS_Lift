import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url.constants'
import { MonthlyServiceComparisonRequest,MonthlyServiceComparisonResponse } from '../interfaces/monthly-service.interface';
@Injectable({
  providedIn: 'root'
})
export class MonthlycomparisonService {
  public monthlyServiceComparison: MonthlyServiceComparisonResponse | undefined;
  constructor(    private http: HttpClient) { }
  getMonthlyServiceComparison(data: MonthlyServiceComparisonRequest |undefined): Observable<MonthlyServiceComparisonResponse> {
    return this.http.post<MonthlyServiceComparisonResponse>(URLS.getExecutiveSummaryUrl, data);
  }
}
