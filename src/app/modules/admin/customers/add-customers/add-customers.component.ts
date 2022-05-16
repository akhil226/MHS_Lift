import { ResetPasswordReq } from './../customer.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, finalize, take, takeUntil } from 'rxjs/operators';
import { AUTHKEY } from 'src/app/modules/shared/constants/auth.constant';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { CustomerService } from '../customer.service';
import { ALERT } from './../../../shared/constants/alert.constant';
import { MENU_KEY } from './../../../shared/constants/settings.constants';
import { BillId } from './../../../shared/interfaces/billid.interface';
import { AlertService } from './../../../shared/services/alert.service';
import { LoaderService } from './../../../shared/services/loader.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { UserService } from './../../../shared/services/user.service';
import { ShippingIdSelectionComponent } from './../shipping-id-selection/shipping-id-selection.component';
import { AddCustomer, AdminSetting, EditUserBill, UserPreAccess } from './add-customer.interface';

type UserBasicInfo = { param1: string, userFname: string, userLname: string, mobileNo: string, superUser: boolean };
@Component({
  selector: 'app-add-customers',
  templateUrl: './add-customers.component.html',
  styleUrls: ['./add-customers.component.scss']
})
export class AddCustomersComponent implements OnInit, OnDestroy {
  billingDetails: BillId[] = [];
  dashboardSettings: AdminSetting[] | undefined;
  notificationSettings: AdminSetting[] | undefined;
  keyFeatureSettings: AdminSetting[] | undefined;
  reqFeatureSettings: AdminSetting[] | undefined;
  notificationMenuIds: { [key: string]: boolean } = {};
  userBasicInfoForm: FormGroup = this.formBuilder.group({
    userFname: ['', Validators.required],
    userLname: ['', Validators.required],
    param1: ['', [Validators.required, Validators.email]],
    mobileNo: ['', Validators.required],
    superUser: false
  });
  settingsForm: FormGroup | undefined;
  isEdit = false;
  private resetPassword: ResetPasswordReq | undefined;
  private editUserCode = '';
  private editUserMail = '';
  private settings: AdminSetting[] | undefined;
  private unSubscribe$ = new Subject();
  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private notification: NotificationService,
    private router: Router,
    private user: UserService,
    private alert: AlertService,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this._initCustomer();
    this._onSuperUserChange();
  }
  private _initCustomer(): void {
    if (this._checkIfEdit()) {
      const { id } = this.activatedRoute.snapshot.params;
      this._getEditUserDetails(id);
    } else {
      this._getAdminSettings();
    }
  }
  private _checkIfEdit(): boolean {
    const url = this.router.url;
    if (url.includes('edit')) {
      return this.isEdit = true;
    }
    return this.isEdit = false;
  }
  private _getEditUserDetails(id: string): void {
    this.loader.show();
    this.customerService.getEditUserDetails(id).pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(({ userBillIds, userPreAccess, ...userDetails }) => {
      const { email: param1, userFName: userFname, userLName: userLname, mobileNo, superUser, userCode } = userDetails;
      this.editUserCode = userCode;
      this.editUserMail = param1;
      this.resetPassword = {
        param1, param2: '', userCodeForPassword: userCode, userFNameForPassword: userFname, userLNameForPassword: userLname
      };
      const isSuperUser = superUser === AUTHKEY.SUPER;
      const userInfo = { param1, userFname, userLname, mobileNo, superUser: isSuperUser };
      this._setUserDetails(userInfo);
      this._generateSettingsForm(userPreAccess);
      this._setBillingId(userBillIds);
    });
  }
  private _setUserDetails(userInfo: UserBasicInfo): void {
    this.userBasicInfoForm.setValue(userInfo, { emitEvent: false });
  }
  private _setBillingId(bill: EditUserBill[]): void {
    const billsWithShppingIdSelected = bill.map(({ selectDetails, unselectDetails, ...data }) =>
    ({
      ...data, details: [
        ...selectDetails.map(ship => ({ ...ship, selected: true })),
        ...unselectDetails.map(ship => ({ ...ship, selected: false }))
      ]
    }));
    this.billingDetails = billsWithShppingIdSelected;
  }
  /**
   * utility to filter menu based on menu type
   * @param settings menu settings from api
   * @param menuKey menu key to filter menu
   * @returns AdminSetting interface
   */
  private _findMenu(settings: AdminSetting[], menuKey: string): AdminSetting[] {
    return settings.filter(({ menuType }) => menuType === menuKey);
  }
  private _generateSettingsForm(settings: AdminSetting[]): void {
    this.settings = settings;
    this.keyFeatureSettings = this._findMenu(settings, MENU_KEY.keyFeatures);
    this.reqFeatureSettings = this._findMenu(settings, MENU_KEY.reqFeatures);
    this.dashboardSettings = this._findMenu(settings, MENU_KEY.dashboard);
    this.notificationSettings = this._findMenu(settings, MENU_KEY.notification);
    const availableNotiMenuIds = this.notificationSettings.map(({ menuId }) => ({ [menuId]: true }));
    this.notificationMenuIds = Object.assign({}, ...availableNotiMenuIds);
    const settingsForm: any = {};
    settings.forEach(({ menuId, menuStatus, menuType, userMenuStatus }) => {
      settingsForm[menuId] = this.isEdit ?
        menuType === MENU_KEY.notification ?
          userMenuStatus === 'A'
          : menuStatus === 'A'
        : false;
    });
    this.settingsForm = this.formBuilder.group(settingsForm);
    if (!this.isEdit) {
      this._enableEmailNotifications();
    }
  }
  private _enableEmailNotifications(): void {
    this.settingsForm?.get('13')?.setValue(true);
    this.settingsForm?.get('9')?.setValue(true);
  }
  private _getAdminSettings(): void {
    this.loader.show();
    this.customerService.getAdminSettings().pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(settings => this._generateSettingsForm(settings));
  }
  private _onSuperUserChange(): void {
    this.userBasicInfoForm.get('superUser')?.valueChanges.pipe(
      filter(isSuperUser => isSuperUser),
      take(1)
    ).subscribe(() => this._enableAllSettings());
  }
  private _enableAllSettings(): void {
    this.settings?.forEach(({ menuId }) => this.settingsForm?.get(menuId)?.setValue(true));
  }
  /**
   * method to show shippinng id selection popup
   * @param billingDetails billing detils object containing the shipping id of selected billid
   */
  showShippingIdSelection(billingDetails: BillId): void {
    const clonedBillingDetails = JSON.parse(JSON.stringify(billingDetails));
    const dialogRef = this.dialog.open(ShippingIdSelectionComponent, {
      width: '800px',
      // height: '300px',
      data: clonedBillingDetails
    });
    dialogRef.afterClosed().pipe(
      filter(data => data)
    ).subscribe((data: BillId) => {
      const index = this.billingDetails.findIndex(({ billTo }) => billTo === data.billTo);
      this.billingDetails[index] = data;
    });
  }
  onBillingIdChange(bill: BillId): void {
    const billingIdFound = this.billingDetails.some(({ billTo }) => billTo === bill.billTo);
    if (!billingIdFound) {
      if (this.userBasicInfoForm.get('superUser')?.value) {
        bill.details.forEach(data => data.selected = true);
      }
      this.billingDetails = [...this.billingDetails, bill];
    }
  }
  private _deleteBill(index: number): void {
    this.billingDetails.splice(index, 1);
  }
  showDeleteBillingIdPopup(index: number): void {
    const title = ALERT.deleteTitle;
    const content = ALERT.billingIdDeleteMsg;
    this.alert.show({ title, content }).pipe(
      filter(value => value),
      take(1)
    ).subscribe(() => this._deleteBill(index));
  }
  /**
   * utility to check if atleast one billi id is added and all the added billig id has atleast one shipping id selected
   */
  private _billingIdValidity(): boolean {
    const valid = this.billingDetails.every(({ details }) => details.some(({ selected }) => selected));
    if (!this.billingDetails.length) {
      this.notification.showNotification(NOTIFICATION_MSG.billigIdRequired);
      return false;
    } else if (!valid) {
      this.notification.showNotification(NOTIFICATION_MSG.shippingIdRequired);
    }
    return valid;
  }
  /**
   * utility to checkif atlest one privilege is added for the created user
   */
  private _settingsValidity(): boolean {
    if (this.settingsForm?.value) {
      const valid = Object.entries(this.settingsForm?.value).some(([key, value]) => +key < 9 && value);
      if (!valid) {
        this.notification.showNotification(NOTIFICATION_MSG.settingsRequired);
      }
      return valid;
    }
    return false;
  }
  /**
   * utility to check if all basic info is provided
   */
  private _basicInfoValidity(): boolean {
    if (!this.userBasicInfoForm.valid) {
      this.notification.showNotification(NOTIFICATION_MSG.basicInfoRequired);
      return false;
    }
    if (!this._isValidMobileNo()) {
      this.notification.showNotification(NOTIFICATION_MSG.mobileNoValidation);
      return false;
    }
    return true;
  }
  private _generatePayload(): AddCustomer {
    const userDetails = this.user.getUserDetails();
    const userBills = this.billingDetails.map((bill) => {
      const selectedShips = bill.details.filter(({ selected }) => selected);
      return { ...bill, details: selectedShips };
    });
    const userPreAccess: UserPreAccess[] = [];
    Object.entries(this.settingsForm?.value).forEach(([key, value]) => {
      const access: UserPreAccess = { menuId: key, status: value ? 'A' : 'I' };
      userPreAccess.push(access);
    });
    return {
      androidId: null,
      createEdituserCode: this.isEdit ? this.editUserCode : '',
      createEdituserType: AUTHKEY.USER,
      createdBy: userDetails?.userCode,
      iosId: null,
      jobDesignation: null,
      param2: '',
      userBills,
      userPreAccess,
      oldEmail: this.isEdit ? this.editUserMail : null,
      newEmail: this.isEdit ? this.userBasicInfoForm.value.param1 : null,
      ...this.userBasicInfoForm.value,
      superUser: this.userBasicInfoForm.value.superUser ? 'Y' : 'N'
    };
  }
  addOrEditUser(): void {
    if (this._basicInfoValidity() && this._billingIdValidity() && this._settingsValidity()) {
      this.loader.show();
      const payload = this._generatePayload();
      this.customerService.addOrEditCustomer(payload, this.isEdit).pipe(
        takeUntil(this.unSubscribe$),
        finalize(() => this.loader.hide())
      ).subscribe(({ returnCode, returnMsg }) => {
        this.notification.showNotification(returnMsg);
        if (returnCode === 0) {
          this._makeFormPristine();
          this.router.navigateByUrl('/customers');
        }
      });
    }
  }
  trackByBillingID(index: number, item: BillId): string {
    return item.billTo;
  }
  private _makeFormPristine(): void {
    this.userBasicInfoForm.markAsPristine();
    this.settingsForm?.markAsPristine();
    this.billingDetails = [];
  }
  private _checkFormDirty(): boolean {
    return this.userBasicInfoForm.dirty || !!this.billingDetails.length || !!this.settingsForm?.dirty;
  }
  private _isValidMobileNo(): boolean {
    const mobileNo = this.userBasicInfoForm.value.mobileNo;
    const isValidNo = mobileNo.toString().length < 21;
    return isValidNo;
  }
  navBack(): void {
    this.router.navigateByUrl('/customers');
  }
  showResetPopup(): void {
    const title = ALERT.resetPasswordTitle;
    const content = ALERT.resetPasswordMsg;
    this.alert.show({ title, content }).pipe(
      filter(value => value),
      take(1)
    ).subscribe(() => this._resetPassword());
  }
  private _resetPassword(): void {
    this.loader.show();
    const payload = this.resetPassword as ResetPasswordReq;
    this.customerService.resetPassword(payload).pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(({ returnMsg }) => this.notification.showNotification(returnMsg));
  }
  /**
   * @desc method to check if router needed to be deactivated if any input is there in form
   */
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this._checkFormDirty()) {
      return this.alert.showDiscard();
    } else {
      return true;
    }
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
