import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { URLS } from '../../shared/constants/url.constants';
import { CryptoService } from '../../shared/services/crypto.service';
import { FileDownloadService } from '../../shared/services/file-download.service';
import { AddCustomer, AddorEditUserResponse, AdminSetting, AdminSettingResponse, EditUserDetails } from './add-customers/add-customer.interface';
import { CustomerListing, CustomerListReq, UserStatusUpdateReq, ResetPasswordReq } from './customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(
    private http: HttpClient,
    private crypto: CryptoService,
    private file: FileDownloadService<CustomerListReq>
  ) { }
  getAdminSettings(): Observable<AdminSetting[]> {
    const payload = { };
    const { adminSettingsUrl } = URLS;
    return this.http.post<AdminSettingResponse>(adminSettingsUrl, payload).pipe(
      filter(({ returnCode, adminSettings }) => returnCode === 0 && !!adminSettings.length),
      map(({ adminSettings }) => adminSettings)
    );
  }
  addOrEditCustomer(payload: AddCustomer, edit = false): Observable<AddorEditUserResponse> {
    payload.param1 = this.crypto.getEncryptedValue(payload.param1);
    payload.param2 = payload.param2 ? this.crypto.getEncryptedValue(payload.param2) : payload.param1;
    const { addUserUrl, editUserUrl } = URLS;
    const addOrEditUserUrl = edit ? editUserUrl : addUserUrl;
    return this.http.post<AddorEditUserResponse>(addOrEditUserUrl, payload);
  }
  getUsersList(payload: CustomerListReq): Observable<CustomerListing> {
    return this.http.post<CustomerListing>(URLS.userLsitingUrl, payload);
  }
  getEditUserDetails(editUserCode: string): Observable<EditUserDetails> {
    return this.http.post<EditUserDetails>(URLS.editUserDetails, { editUserCode }).pipe(
      filter(({ returnCode }) => returnCode === 0)
    );
  }
  updateUserStatus(payload: UserStatusUpdateReq): Observable<{ returnCode: number, returnMsg: string }> {
    return this.http.post<{ returnCode: number, returnMsg: string }>(URLS.userStatusUpdateUrl, payload);
  }
  resetPassword(payload: ResetPasswordReq): Observable<{ returnCode: number, returnMsg: string }> {
    payload.param1 = this.crypto.getEncryptedValue(payload.param1);
    return this.http.post<{ returnCode: number, returnMsg: string }>(URLS.resetPassword, payload);
  }

  downloadCustomerListPdf(payload: CustomerListReq): void {
    this.file.downloadFile(URLS.customerListPdfDonwload, payload);
  }
}
