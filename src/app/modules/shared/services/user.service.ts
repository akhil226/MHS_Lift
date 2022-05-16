import { Injectable } from '@angular/core';
import { LoginData, UserDetails } from './../../login/login.interface';
import { BillingIdService } from './billing-id.service';

const USERDETAILSKEY = 'UserDetails';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  versionData:LoginData | null=null;
  userData: UserDetails | null = null;
  constructor(
    private billingIdService: BillingIdService,
  ) { }

  setuserDetails(data: UserDetails | null): void {
    if (data) {
      this.userData = data;
      const stringifiedData = JSON.stringify(data);
      localStorage.setItem(USERDETAILSKEY, stringifiedData);
    }
  }
  getUserDetails(): UserDetails | null {
    if (this.userData) {
      return this.userData;
    }
    const stringifiedData = localStorage.getItem(USERDETAILSKEY);
    this.userData = stringifiedData ? JSON.parse(stringifiedData) : null;
    console.log(this.userData)
    return this.userData;
  }
  clearUserDetails(): void {
    this.userData = null;
    this.billingIdService.clearBillingIds();
    localStorage.removeItem(USERDETAILSKEY);
  }
}
