import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BillingIdService } from './billing-id.service';
const BILLING_KEY = 'selectedBillingIds';
@Injectable({
  providedIn: 'root'
})
export class ShippingIdService {
  private billingId$ = new BehaviorSubject<Array<string>>([]);
  private shipId$ = new BehaviorSubject<Array<string>>([]);
  private selectedBillingId: Array<string> | null = null;
  private selectedBillingIdName = '';
  private selectedShipId: Array<string> | null = null;
  constructor(private billingIdService: BillingIdService,) { }
  emitBillingId(billingId: Array<string>, billingName: string ,shipId:Array<string>): void {
    this.selectedBillingId = billingId;
    this.selectedBillingIdName = billingName;
    this.selectedShipId=shipId;
    this.billingId$.next(billingId);
    this._persistBillingIds(billingId, billingName,shipId);
  }
  private _persistBillingIds(id: Array<string> | null, name: string,shipId: Array<string> | null): void {
    const data = { id, name };
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem(BILLING_KEY, stringifiedData);
  }
  getShippingId(){
    return this.shipId$.asObservable();
  }
}
