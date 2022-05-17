import { Component, Input, OnInit } from '@angular/core';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { Dropdown } from './../../shared/components/multiselect/dropdown.interface';
import { BillId } from './../../shared/interfaces/billid.interface';
import { BillingIdService } from './../../shared/services/billing-id.service';
import { NotificationService } from './../../shared/services/notification.service';
import { UserService } from './../../shared/services/user.service';
import { UserPreAccess } from '../../login/login.interface';
import { AUTHKEY } from '../../shared/constants/auth.constant';

@Component({
  selector: 'app-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.scss']
})
export class SubHeaderComponent implements OnInit {
  @Input() show = '';
  billingId: Array<string> = [];
  selectedAdminBillingId = '';
  isAdmin = false;
  billingIdDdl: Dropdown = {
    multi: true,
    placeholder: 'Billing ID',
    data: []
  };
  firstName: string = this.user.getUserDetails()?.userFName || '';
  lastName: string = this.user.getUserDetails()?.userLName || '';
  userPrivilage: UserPreAccess[] = this.user.getUserDetails()?.userPreAccess || [];
  userType: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  constructor(
    private billingIdService: BillingIdService,
    private user: UserService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    const userBillIds = this.user.getUserDetails()?.userBillIds || [];
    this.isAdmin = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN;
    this.billingIdDdl.data = userBillIds?.map(({ billTo, billToAddress, billToName }) =>
      ({ key: billTo, value: `${billTo} | ${billToName} | ${billToAddress}` }));
    const { id, name } = this.billingIdService.restoreSelectedBillingId();
    this.selectedAdminBillingId = this.isAdmin ? name : '';
    if (id) {
      this.billingId = id;
      this.billingIdService.emitBillingId(id, name);
    } else {
      const initialSelectedIds = userBillIds?.map(({ billTo }) => billTo);
      this.billingIdService.emitBillingId(initialSelectedIds);
      this.billingId = initialSelectedIds;
    }
  }
  changeBillingId(): void {
    this.billingIdService.emitBillingId(this.billingId);
  }
  onAdminBillingIdChange(bill: BillId): void {
    const { billTo, billToName, billToAddress } = bill;
    this.selectedAdminBillingId = `${billTo} | ${billToName} | ${billToAddress}`;
    const billingId = [billTo];
    this.billingIdService.emitBillingId(billingId, this.selectedAdminBillingId);
  }
}
