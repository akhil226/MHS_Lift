import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const BILLING_KEY = 'selectedBillingIds';
@Injectable({
  providedIn: 'root'
})
export class BillingIdService {
  private billingId$ = new BehaviorSubject<Array<string>>([]);
  private shipId$ = new BehaviorSubject<Array<string>>([]);
  private selectedBillingId: Array<string> | null = null;
  private selectedBillingIdName = '';
  private selectedShipId: Array<string> | null = null;
  constructor() { }

  emitBillingId(billingId: Array<string>, billingName = ''): void {
    this.selectedBillingId = billingId;
    this.selectedBillingIdName = billingName;
    this.billingId$.next(billingId);
    this._persistBillingIds(billingId, billingName);
  }
  getBillingId(): Observable<Array<string>> {
    return this.billingId$.asObservable();
  }


  emitShippingId(shippingId: Array<string>){
    this.selectedShipId=shippingId;
  }


  restoreSelectedBillingId(): { id: Array<string> | null, name: string} {
    if (this.selectedBillingId) {
      return { id: this.selectedBillingId, name: this.selectedBillingIdName };
    }
    return this._getPersistedBillingIds();
  }
  clearBillingIds(): void {
    this.selectedBillingId = null;
    this.selectedBillingIdName = '';
    this._clearPersistedBillingIds();
  }
  private _persistBillingIds(id: Array<string> | null, name: string): void {
    const data = { id, name };
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem(BILLING_KEY, stringifiedData);
  }
  private _getPersistedBillingIds(): { id: Array<string> | null, name: string} {
    const data = localStorage.getItem(BILLING_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { id: null, name: ''};
  }
  private _clearPersistedBillingIds(): void {
    localStorage.removeItem(BILLING_KEY);
  }
}
