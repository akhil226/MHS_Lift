import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { NotificationService } from '../shared/services/notification.service';
import { ResetPwdData, UserDetails, UserPreAccess } from './../login/login.interface';
import { LoginService } from './../login/login.service';
import { NOTIFICATION_MSG } from './../shared/constants/notification.constant';
import { MENU_KEY } from './../shared/constants/settings.constants';
import { SettingsPreAccess, UpdateUserPrevAccessRequest } from './../shared/interfaces/settings.interface';
import { AlertService } from './../shared/services/alert.service';
import { LoaderService } from './../shared/services/loader.service';
import { SettingsService } from './../shared/services/settings.service';
import { UserService } from './../shared/services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  userDetails: UserDetails | null = null;
  userPrivilege: UserPreAccess[] = [];
  dashboardSettings: UserPreAccess[] | undefined;
  notificationSettings: UserPreAccess[] | undefined;
  dashboardSettingsForm: FormGroup | undefined;
  notificationSettingsForm: FormGroup | undefined;
  notificationMenuIds: { [key: string]: boolean } = {};
  resetForm = this.formBuilder.group({
    param2: ['', Validators.required],
    param3: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });
  private unsubscribe$ = new Subject();
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private settingService: SettingsService,
    private loader: LoaderService,
    private notification: NotificationService,
    private loginService: LoginService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.userService.getUserDetails();
    this.userPrivilege = this.userDetails?.userPreAccess || [];
    this._generateSettingsForm(this.userPrivilege);
  }
  private _findMenu(privileges: UserPreAccess[], menuKey: string): UserPreAccess[] {
    return privileges.filter(({ menuType, menuStatus, adminMenuStatus }) =>
      menuType === menuKey && (menuKey === MENU_KEY.notification || menuStatus === 'A')
      && adminMenuStatus === 'A');
  }
  private _createActiveMenuForm(menus: UserPreAccess[]): { [key: string]: boolean } {
    const settingsForm: { [key: string]: boolean } = {};
    menus.forEach(({ menuId, userMenuStatus }) =>
      settingsForm[menuId] = userMenuStatus === 'A'
    );
    return settingsForm;
  }
  private _generateSettingsForm(privileges: UserPreAccess[]): void {
    this.dashboardSettings = this._findMenu(privileges, MENU_KEY.dashboard);
    this.notificationSettings = this._findMenu(privileges, MENU_KEY.notification);
    const dashboardSettingsForm = this._createActiveMenuForm(this.dashboardSettings);
    const notificationForm = this._createActiveMenuForm(this.notificationSettings);
    this.dashboardSettingsForm = this.formBuilder.group(dashboardSettingsForm);
    this.notificationSettingsForm = this.formBuilder.group(notificationForm);
    const availableNotiMenuIds = this.notificationSettings.map(({ menuId }) => ({ [menuId]: true }));
    this.notificationMenuIds = Object.assign({}, ...availableNotiMenuIds);
  }
  private _generateSettingsPayload(formValue: { [key: string]: boolean }): UpdateUserPrevAccessRequest {
    if (formValue) {
      const userPrivileg: SettingsPreAccess[] = Object.entries(formValue).map(
        ([key, value]) => ({ menuId: key, status: value ? 'A' : 'I' }));
      return { billingId: [], userPreAccess: userPrivileg };
    }
    return { billingId: [], userPreAccess: [] };
  }
  private _updateLocalUserPrivilege(updatedUserPrivilege: SettingsPreAccess[]): void {
    const updatedAccess = updatedUserPrivilege.map(({ menuId, status }) => ({ userMenuStatus: status, menuId }));
    const userPrivilege = this.userPrivilege.map(privilege => ({
      ...privilege,
      ...(updatedAccess.find(({ menuId }) => privilege.menuId === menuId) || [])
    }));
    (this.userDetails as UserDetails).userPreAccess = userPrivilege;
    this.userService.setuserDetails(this.userDetails);
  }
  private _resetSettings(): void {
    this.userDetails = this.userService.getUserDetails();
    this.userPrivilege = this.userDetails?.userPreAccess || [];
    this._generateSettingsForm(this.userPrivilege);
  }
  private _callUpdateUserPrivilegeApi(payload: UpdateUserPrevAccessRequest): void {
    this.loader.show();
    this.settingService.updateUserAccessPrivilages(payload).pipe(
      finalize(() => this.loader.hide()),
      takeUntil(this.unsubscribe$)
    ).subscribe(({ returnCode, returnMsg }) => {
      this.notification.showNotification(returnMsg);
      if (returnCode === 0) {
        this._updateLocalUserPrivilege(payload.userPreAccess);
        this.dashboardSettingsForm?.markAsPristine();
        this.notificationSettingsForm?.markAsPristine();
      } else {
        this._resetSettings();
      }
    }, () => this._resetSettings());
  }
  submitSettings(type: 'DASHBOARD' | 'NOTIFICATION'): void {
    const formValue = type === 'DASHBOARD' ? this.dashboardSettingsForm?.value : this.notificationSettingsForm?.value;
    const payload = this._generateSettingsPayload(formValue);
    this._callUpdateUserPrivilegeApi(payload);
  }
  resetPassword(): void {
    if (this.resetForm.valid) {
      if (this.resetForm.value.param3 === this.resetForm.value.param2) {
        this.notification.showNotification(NOTIFICATION_MSG.samePassword);
      } else if (this.resetForm.value.param3 === this.resetForm.value.confirmPassword) {
        this.loader.show();
        const resetPwdData: ResetPwdData = { ...this.resetForm.value, param1: this.userDetails?.email };
        this.loginService.resetPassword(resetPwdData).pipe(
          finalize(() => this.loader.hide()),
          takeUntil(this.unsubscribe$)
        ).subscribe(({ returnMsg, returnCode }) => {
          this.notification.showNotification(returnMsg);
          if (returnCode === 0) {
            this.resetForm.reset();
            this.loginService.logout();
          }
        });
      } else {
        this.notification.showNotification(NOTIFICATION_MSG.passwordNotMatch);
      }
    }
  }
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.resetForm.dirty || this.dashboardSettingsForm?.dirty || this.notificationSettingsForm?.dirty) {
      return this.alert.showDiscard();
    } else {
      return true;
    }
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
