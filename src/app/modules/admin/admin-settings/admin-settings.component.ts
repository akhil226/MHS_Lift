import { UserService } from 'src/app/modules/shared/services/user.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ResetPwdData, UserDetails } from '../../login/login.interface';
import { LoginService } from '../../login/login.service';
import { NOTIFICATION_MSG } from '../../shared/constants/notification.constant';
import { MENU_KEY } from '../../shared/constants/settings.constants';
import { SettingsPreAccess } from '../../shared/interfaces/settings.interface';
import { AlertService } from '../../shared/services/alert.service';
import { LoaderService } from '../../shared/services/loader.service';
import { NotificationService } from '../../shared/services/notification.service';
import { STATUS } from './../../shared/constants/status.constant';
import { AdminSettingsUpdate, AllAdminSetting } from './admin-settings.interface';
import { AdminSettingsService } from './admin-settings.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  userDetails: UserDetails | null = this.userService.getUserDetails();
  adminSettings: AllAdminSetting[] = [];
  keyFeatureSettings: AllAdminSetting[] | undefined;
  reqFeatureSettings: AllAdminSetting[] | undefined;
  dashboardSettings: AllAdminSetting[] | undefined;
  notificationSettings: AllAdminSetting[] | undefined;
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
    private adminSettingsService: AdminSettingsService,
    private loader: LoaderService,
    private notification: NotificationService,
    private loginService: LoginService,
    private alert: AlertService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this._getAdminSettings();
  }
  private _getAdminSettings(): void {
    this.loader.show();
    this.adminSettingsService.getAdminSettings().pipe(
      finalize(() => this.loader.hide()),
      takeUntil(this.unsubscribe$)
    ).subscribe(({ adminSettings }) => this._generateSettingsForm(adminSettings));
  }
  private _findMenu(settings: AllAdminSetting[], menuKey: string): AllAdminSetting[] {
    return settings.filter(({ menuType }) => menuType === menuKey);
  }
  private _createSettingsForm(menus: AllAdminSetting[]): { [key: string]: boolean } {
    const settingsForm = menus.map(({ menuId, menuStatus }) => ({ [menuId]: menuStatus === STATUS.active }));
    return Object.assign({}, ...settingsForm);
  }
  private _generateSettingsForm(settings: AllAdminSetting[]): void {
    this.adminSettings = settings;
    this.keyFeatureSettings = this._findMenu(settings, MENU_KEY.keyFeatures);
    this.reqFeatureSettings = this._findMenu(settings, MENU_KEY.reqFeatures);
    const featureSettings = [...this.keyFeatureSettings, ...this.reqFeatureSettings];
    this.dashboardSettings = this._findMenu(settings, MENU_KEY.dashboard);
    this.notificationSettings = this._findMenu(settings, MENU_KEY.notification);
    const featureForm = this._createSettingsForm(featureSettings);
    const dashboardSettingsForm = this._createSettingsForm(this.dashboardSettings);
    const dashboardForm = { ...dashboardSettingsForm, ...featureForm };
    const notificationForm = this._createSettingsForm(this.notificationSettings);
    this.dashboardSettingsForm = this.formBuilder.group(dashboardForm);
    this.notificationSettingsForm = this.formBuilder.group(notificationForm);
  }
  private _generateSettingsPayload(formValue: { [key: string]: boolean }): AdminSettingsUpdate {
    if (formValue) {
      const settings: SettingsPreAccess[] = Object.entries(formValue).map(
        ([key, value]) => ({ menuId: key, status: value ? 'A' : 'I' }));
      return { adminPreAccess: settings };
    }
    return { adminPreAccess: [] };
  }
  private _callUpdateSettingsApi(paylaod: AdminSettingsUpdate): void {
    this.loader.show();
    this.adminSettingsService.updateAdminSettings(paylaod).pipe(
      finalize(() => this.loader.hide()),
      takeUntil(this.unsubscribe$)
    ).subscribe(({ returnCode, returnMsg }) => {
      this.notification.showNotification(returnMsg);
      if (returnCode === 0) {
        this.dashboardSettingsForm?.markAsPristine();
        this.notificationSettingsForm?.markAsPristine();
      } else {
        this._generateSettingsForm(this.adminSettings);
      }
    });
  }
  submitSettings(type: 'DASHBOARD' | 'NOTIFICATION'): void {
    const formValue = type === 'DASHBOARD' ? this.dashboardSettingsForm?.value : this.notificationSettingsForm?.value;
    const payload = this._generateSettingsPayload(formValue);
    this._callUpdateSettingsApi(payload);
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
