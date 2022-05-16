import { Component, OnInit, OnDestroy } from '@angular/core';
import { Dropdown, DropDownData } from 'src/app/modules/shared/components/multiselect/dropdown.interface';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UserService } from 'src/app/modules/shared/services/user.service';
import { EquipmentListMetadataResponse, EquipmentListMetadataRequest, Equipment } from 'src/app/modules/shared/interfaces/equipment.interface';
import { RequestService } from 'src/app/modules/shared/services/request.service';
import { LoaderService } from 'src/app/modules/shared/services/loader.service';
import { BillingIdService } from 'src/app/modules/shared/services/billing-id.service';
import { takeUntil, finalize, filter, switchMap, take, first } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { CryptoService } from 'src/app/modules/shared/services/crypto.service';
import { ServiceRequest, Attachment } from 'src/app/modules/shared/interfaces/request.interface';
import { AttachmentService } from 'src/app/modules/shared/services/attachment.service';
import { ColumnDefs, TableSettings } from 'src/app/modules/shared/components/table/table.interface';
import { ATTACHMENT_LIST } from 'src/app/modules/shared/constants/table.constant';
import { AlertService } from 'src/app/modules/shared/services/alert.service';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss']
})
export class ServiceRequestComponent implements OnInit, OnDestroy {
  equipmetMetadata: EquipmentListMetadataResponse | undefined;
  private unSubscribe$ = new Subject();

  serialNoDd: Dropdown = {
    multi: false,
    placeholder: 'Select Serial #',
    data: []
  };
  unitNoDd: Dropdown = {
    multi: false,
    placeholder: 'Select Unit #',
    data: []
  };
  serviceRequestForm: FormGroup | undefined;
  email = this.userService.getUserDetails()?.email;
  attachmentList: Attachment[] = [];
  attachmentListColumns: Array<ColumnDefs> = ATTACHMENT_LIST as Array<ColumnDefs>;
  attachmentListSettings: TableSettings = { expandable: false, selectable: false, pagination: false };
  private emergencyServiceMsg = NOTIFICATION_MSG.EmergencyServiceMsg;
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private requestService: RequestService,
    private loader: LoaderService,
    private notification: NotificationService,
    private billingId: BillingIdService,
    private crypto: CryptoService,
    private alert: AlertService,
    private attachmentService: AttachmentService,
    private router: Router
  ) {
  }
  navCheck(): void {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      first(),
    ).subscribe((data => {
      if (data.url !== '/dashboard/pm-request') {
        this.requestService.setSelectedEquipmentsToCreateRequest([]);
      }
    }));
  }
  ngOnInit(): void {
    this.getEmergencyServiceMsg();
    this.getBillingId();
    this.navCheck();
  }
  getEmergencyServiceMsg(): void {
    this.requestService.getEmergencyServiceMetadata().subscribe(msg => this.emergencyServiceMsg = msg);
  }
  populateServiceRequestForm(): void {
    this.serviceRequestForm = this.formBuilder.group({
      equipSrNo: ['', Validators.required],
      equipUnitNo: ['', Validators.required],
      equipMake: ['', Validators.required],
      equipModel: ['', Validators.required],
      equipLocation: ['', Validators.required],
      companyName: ['', Validators.required],
      contactName: [`${this.userService.getUserDetails()?.userFName} ${this.userService.getUserDetails()?.userLName}`, Validators.required],
      contactPhones: [this.userService.getUserDetails()?.mobileNo, Validators.required],
      poNumber: '',
      requestDesc: ['', Validators.required],
      contactEmails: [this.userService.getUserDetails()?.email, [Validators.required]],
      truckDown: ['N', Validators.required],
      needEmService: false,
      billTo: '',
      requestforUserCode: this.userService.getUserDetails()?.userCode,
      shipTo: '',
      userName: `${this.userService.getUserDetails()?.userFName} ${this.userService.getUserDetails()?.userLName}`,
      userPhone: this.userService.getUserDetails()?.mobileNo
    });
    this.onValueChanges();
    this.findEquipment(this.requestService.getSelectedEquipmentsToCreateRequest()?.[0], null);
    // this.requestService.setSelectedEquipmentsToCreateRequest([]);
    this.attachmentList = [];
  }
  onValueChanges(): void {
    this.serviceRequestForm?.get('equipSrNo')?.valueChanges.pipe(
      takeUntil(this.unSubscribe$),
    ).subscribe(val => {
      this.findEquipment(val, null);
    });
    this.serviceRequestForm?.get('equipUnitNo')?.valueChanges.pipe(
      takeUntil(this.unSubscribe$),
    ).subscribe(val => {
      this.findEquipment(null, val);
    });
    this.serviceRequestForm?.get('needEmService')?.valueChanges.pipe(
      takeUntil(this.unSubscribe$),
    ).subscribe(val => {
      if (val) {
        const openTime = 7 * 60;  // minutes
        const closedTime = 17 * 60;  // minutes
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since Midnight
        const isSatOrSun = (now.getDay() === 6 || now.getDay() === 0);
        if (!(currentTime > openTime && currentTime < closedTime) || isSatOrSun) {
          this.notification.emergencyServiceNotification(this.emergencyServiceMsg);
        }
      }
    });
  }
  findEquipment(equipSrNo?: string | null, equipUnitNo?: string | null): void {
    if (equipSrNo || equipUnitNo) {
      this.equipmetMetadata?.equipmentList.forEach(data => {
        if (equipSrNo === data.equipSerialNo || equipUnitNo === data.unitNo) {
          this.serviceRequestForm?.get('equipSrNo')?.setValue(data.equipSerialNo, { emitEvent: false });
          this.serviceRequestForm?.get('equipUnitNo')?.setValue(data.unitNo, { emitEvent: false });
          this.serviceRequestForm?.get('equipMake')?.setValue(data.equipMake, { emitEvent: false });
          this.serviceRequestForm?.get('equipModel')?.setValue(data.equipModel, { emitEvent: false });
          this.serviceRequestForm?.get('equipLocation')?.setValue(data.location, { emitEvent: false });
          this.serviceRequestForm?.get('billTo')?.setValue(data.billTo, { emitEvent: false });
          this.serviceRequestForm?.get('shipTo')?.setValue(data.shipTo, { emitEvent: false });
          this.serviceRequestForm?.get('companyName')?.setValue(data.company, { emitEvent: false });

        }
      });
    } else {
      this.serviceRequestForm?.get('equipSrNo')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('equipUnitNo')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('equipMake')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('equipModel')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('equipLocation')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('billTo')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('shipTo')?.setValue('', { emitEvent: false });
      this.serviceRequestForm?.get('companyName')?.setValue('', { emitEvent: false });
    }

  }

  onReset(): void {
    // this.requestService.setSelectedEquipmentsToCreateRequest([]);
    this.attachmentList = [];
    this.populateServiceRequestForm();
    this.serviceRequestForm?.get('contactPhones')?.setValue(this.userService.getUserDetails()?.mobileNo);
  }
  submitRequestService(): void {
    if (this._serviceRequestFormValidity()) {
      this.loader.show();
      const requestData: ServiceRequest = {
        ...this.serviceRequestForm?.value, needEmService: this.serviceRequestForm?.get('needEmService')?.value ? 'Y' : 'N'
        , platform: 'WEB', serviceType: '0', requestType: 'MHSWOR',
         contactEmails: (this.serviceRequestForm?.value.contactEmails?.trim())?.replace(/\s\s+/g, ',')?.replace(/\n+/g, ',').replace(',,', ','),
        param1: this.crypto.getEncryptedValue(this.userService.getUserDetails()?.email || ''), attachments: [...this.attachmentList]
      };
      this.requestService.createRequestService(requestData).pipe(
        takeUntil(this.unSubscribe$),
        finalize(() => this.loader.hide())
      ).subscribe(res => {
        if (res.returnCode === 0) {
          this.requestService.setSelectedEquipmentsToCreateRequest([]);
          this.populateServiceRequestForm();
          this.serviceRequestForm?.get('contactPhones')?.setValue(this.userService.getUserDetails()?.mobileNo);
          this.notification.showNotification(res.returnMsg);
        } else {
          this.notification.showNotification(res.returnMsg);
        }

      });

    }
  }
  private _isValidMobileNo(): boolean {
    const mobileNo = this.serviceRequestForm?.value.contactPhones;
    const mobRegEx = new RegExp(/\w*\d/g);
    const isValidMobRegEx = mobRegEx.test(mobileNo);
    const isValidNo = mobileNo.toString().length < 21;
    return isValidMobRegEx && isValidNo;
  }
  private _isValidEmails(): boolean {
    const emails = (this.serviceRequestForm?.value.contactEmails?.trim())?.replace(/\s\s+/g, ',')?.replace(/\n+/g, ',').replace(',,', ',');
    // const emails = this.serviceRequestForm?.value.contactEmails;
    const regex = /^(,?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/gi;
    return regex.test(emails);
  }
  private _serviceRequestFormValidity(): boolean {
    if (!this.serviceRequestForm?.valid) {
      this.notification.showNotification(NOTIFICATION_MSG.mandatoryMsg);
      return false;
    }
    if (!this._isValidMobileNo()) {
      this.notification.showNotification(NOTIFICATION_MSG.mobileNoValidation);
      return false;
    }
    if (!this._isValidEmails()) {
      this.notification.showNotification(NOTIFICATION_MSG.emailValidation);
      return false;
    }
    return true;
  }
  public getBillingId(): void { 
    this.billingId.getBillingId().pipe(
      filter(billingId => !!billingId?.length),
      switchMap(billingId =>
        this.getEquipmentList(billingId)
      ),
      takeUntil(this.unSubscribe$)
    ).subscribe(res => {
      this.equipmetMetadata = res;
      if (this.equipmetMetadata.returnCode === 0) {
        const serialList: DropDownData[] = [];
        const unitNoList: DropDownData[] = [];
        this.equipmetMetadata.equipmentList.forEach(data => {
          serialList.push({ key: data.equipSerialNo, value: data.equipSerialNo });
          unitNoList.push({ key: data.unitNo, value: data.unitNo });
        });
        this.serialNoDd = { ...this.serialNoDd, data: [...serialList] };
        this.unitNoDd = { ...this.unitNoDd, data: [...unitNoList] };
      } else {
        this.notification.showNotification(this.equipmetMetadata.returnMsg);
      }
      this.populateServiceRequestForm();
      // this.serviceRequestForm?.get('contactPhones')?.setValue(this.userService.getUserDetails()?.mobileNo);

    });
  }

  public getEquipmentList(billingId: string[]): Observable<EquipmentListMetadataResponse> {
    this.loader.show();
    const equipmentRequest: EquipmentListMetadataRequest = {
      billingId
    };
    return this.requestService.getRequestServiceMetadata(equipmentRequest).pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    );
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
  deleteAttachment(index: number): void {
    this.attachmentList.splice(index, 1);
    this.attachmentList = [...this.attachmentList];
  }
  private _checkFormDirty(): boolean {
    return this.serviceRequestForm?.dirty || !!this.attachmentList.length;
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

  getAttchment(item: any): void {

    this.attachmentService.processAttchment(item[0])?.then(res => {
      if (res) {
        this.attachmentList.push(res);
        this.attachmentList = [...this.attachmentList];
      }
    });
  }
}
