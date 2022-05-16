import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { URLS } from './../../constants/url.constants';
import { BillId, BillingId, BillingIdRequest } from './../../interfaces/billid.interface';
import { UserService } from './../../services/user.service';

@Injectable({
  providedIn: 'any'
})
export class BillingIdSearchService {

  constructor(
    private http: HttpClient,
  ) { }

  searchBilllingId(billingId: string): Observable<BillId[]> {
    const url = URLS.getBillingId;
    const payLoad: BillingIdRequest = {
      billingId
    };
    return this.http.post<BillingId>(url, payLoad).pipe(
      map(({ returnCode, billIds }) => returnCode === 0 ? billIds : [])
    );
  }
}
