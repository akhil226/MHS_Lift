import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AddCustomer } from '../../customers/add-customers/add-customer.interface';
import { CustomerService } from '../../customers/customer.service';
import { AUTHKEY } from './../../../shared/constants/auth.constant';
import { NOTIFICATION_MSG } from './../../../shared/constants/notification.constant';
import { AlertService } from './../../../shared/services/alert.service';
import { LoaderService } from './../../../shared/services/loader.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { UserService } from './../../../shared/services/user.service';

type UserBasicInfo = { param1: string, userFname: string, userLname: string, mobileNo: string, jobDesignation: string };

const PASSWORD_PATTERN = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/g;
@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.scss']
})
export class AddAdminComponent implements OnInit {
  adminForm: FormGroup = this.formBuilder.group({
    userFname: ['', Validators.required],
    userLname: ['', Validators.required],
    param1: ['', [Validators.required, Validators.email]],
    mobileNo: ['', Validators.required],
    jobDesignation: ['', Validators.required],
  });
  isEdit = true;
  private editUserMail = '';
  private editUserCode = '';
  private unSubscribe$ = new Subject();
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private user: UserService,
    private customerService: CustomerService,
    private notification: NotificationService,
    private alert: AlertService,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this._initCustomer();
  }
  private _checkIfEdit(): boolean {
    const url = this.router.url;
    if (url.includes('edit')) {
      return this.isEdit = true;
    }
    return this.isEdit = false;
  }
  private _initCustomer(): void {
    if (this._checkIfEdit()) {
      const { id } = this.activatedRoute.snapshot.params;
      this._getEditUserDetails(id);
    } else {
      this._createPasswordControls();
    }
  }
  private _createPasswordControls(): void {
    this.adminForm.addControl('param2', this.formBuilder.control('', Validators.required));
    this.adminForm.addControl('confirmParam2', this.formBuilder.control('', Validators.required));
  }
  private _getEditUserDetails(id: string): void {
    this.loader.show();
    this.customerService.getEditUserDetails(id).pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(({ userBillIds, userPreAccess, ...userDetails }) => {
      const { email: param1, userFName: userFname, userLName: userLname, mobileNo, userCode, jobDesignation } = userDetails;
      this.editUserCode = userCode;
      this.editUserMail = param1;
      const userInfo: UserBasicInfo = { param1, userFname, userLname, mobileNo, jobDesignation };
      this._setUserDetails(userInfo);
    });
  }
  private _setUserDetails(userInfo: UserBasicInfo): void {
    this.adminForm.setValue(userInfo);
  }
  private _generatePayload(): AddCustomer {
    const userDetails = this.user.getUserDetails();
    return {
      androidId: null,
      createEdituserCode: this.isEdit ? this.editUserCode : '',
      createEdituserType: AUTHKEY.ADMIN,
      createdBy: userDetails?.userCode,
      iosId: null,
      param2: '',
      userBills: [],
      userPreAccess: [],
      superUser: 'N',
      oldEmail: this.isEdit ? this.editUserMail : null,
      newEmail: this.isEdit ? this.adminForm.value.param1 : null,
      ...this.adminForm.value,
    };
  }
  private _validateForm(): boolean {
    if (!this.adminForm.valid) {
      this.notification.showNotification(NOTIFICATION_MSG.mandatoryMsg);
      return false;
    }
    if (!this._isValidMobileNo()) {
      this.notification.showNotification(NOTIFICATION_MSG.mobileNoValidation);
      return false;
    }
    return true;
  }
  private _passwordMatch(): boolean {
    if (this.isEdit) {
      return true;
    }
    const { param2, confirmParam2 } = this.adminForm.value;
    if (param2 !== confirmParam2) {
      this.notification.showNotification(NOTIFICATION_MSG.passwordNotMatch);
      return false;
    }
    if (!this._validatePassword(confirmParam2)) {
      this.notification.showNotification(NOTIFICATION_MSG.InvalidPasswordPattern);
      return false;
    }
    return true;
  }
  private _isValidMobileNo(): boolean {
    const mobileNo = this.adminForm.value.mobileNo;
    const isValidNo = mobileNo.toString().length < 21;
    return isValidNo;
  }
  private _validatePassword(value: string): boolean {
    const regex = PASSWORD_PATTERN;
    return regex.test(value);
  }
  addOrEditAdmin(): void {
    if (this._validateForm() && this._isValidMobileNo() && this._passwordMatch()) {
      this.loader.show();
      const payload = this._generatePayload();
      this.customerService.addOrEditCustomer(payload, this.isEdit).pipe(
        finalize(() => this.loader.hide())
      ).subscribe(({ returnCode, returnMsg }) => {
        this.notification.showNotification(returnMsg);
        if (returnCode === 0) {
          this.adminForm.markAsPristine();
          this.router.navigateByUrl('/admin');
        }
      });
    }
  }
  navBack(): void {
    this.router.navigateByUrl('/admin');
  }
  /**
   * @desc method to check if router needed to be deactivated if any input is there in form
   */
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    return this.adminForm.dirty ? this.alert.showDiscard() : true;
  }
}
