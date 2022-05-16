import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { URLS } from '../constants/url.constants';
import { DepartmentMetaData, InvoiceListRequest, InvoiceListResponse } from '../interfaces/invoice.interface';
import { DepartmentList, InvoicePdfDownload } from './../interfaces/invoice.interface';
import { FileDownloadService } from './file-download.service';

@Injectable({
  providedIn: 'any'
})
export class InvoiceService {
  constructor(
    private http: HttpClient,
    private file: FileDownloadService<InvoiceListRequest | InvoicePdfDownload>
  ) { }

  getInvoiceList(data: InvoiceListRequest): Observable<InvoiceListResponse> {
    return this.http.post<InvoiceListResponse>(URLS.getInvoiceListUrl, data).pipe(
      map(({ invoiceList, ...data }) => ({
        ...data, invoiceList: invoiceList.map(({ invoiceDueAmt, invoicePaidAmt, ...invoice }) => ({
          ...invoice, invoiceDueAmt: invoiceDueAmt ? `$${invoiceDueAmt}` : `-`, invoicePaidAmt: invoicePaidAmt ? `$${invoicePaidAmt}` : `-`
        }))
      })));
  }

  getInvoiceDepartmentMetadata(data: any): Observable<DepartmentList[]> {
    return this.http.post<DepartmentMetaData>(URLS.departmentUrl, data).pipe(
      map(({ returnCode, departmentList }) => returnCode === 0 ? departmentList : [])
    );
  }

  downloadEquipmentListReport(payload: InvoiceListRequest): void {
    this.file.downloadFile(URLS.invoiceListDownload, payload);
  }
  downloadinvoicePdf(payload: InvoicePdfDownload): void {
    this.file.downloadFile(URLS.invoicePdfDonwload, payload);
  }
}
