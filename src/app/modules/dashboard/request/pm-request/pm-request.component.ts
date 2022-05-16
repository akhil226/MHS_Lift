import { Component, OnInit, OnDestroy } from '@angular/core';
import { Dropdown, DropDownData } from 'src/app/modules/shared/components/multiselect/dropdown.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/modules/shared/services/user.service';
import { EquipmentListMetadataResponse, EquipmentListMetadataRequest, Equipment } from 'src/app/modules/shared/interfaces/equipment.interface';
import { RequestService } from 'src/app/modules/shared/services/request.service';
import { LoaderService } from 'src/app/modules/shared/services/loader.service';
import { BillingIdService } from 'src/app/modules/shared/services/billing-id.service';
import { takeUntil, finalize, filter, switchMap, first } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { CryptoService } from 'src/app/modules/shared/services/crypto.service';
import { PMRequestModal, PMEquipModal, Attachment } from 'src/app/modules/shared/interfaces/request.interface';
import { ColumnDefs, TableSettings } from 'src/app/modules/shared/components/table/table.interface';
import { PM_REQUEST_EQUIPLIST, ATTACHMENT_LIST } from 'src/app/modules/shared/constants/table.constant';
import { AttachmentService } from 'src/app/modules/shared/services/attachment.service';
import { AlertService } from 'src/app/modules/shared/services/alert.service';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-pm-request',
  templateUrl: './pm-request.component.html',
  styleUrls: ['./pm-request.component.scss']
})
export class PmRequestComponent implements OnInit, OnDestroy {
  equipmetMetadata: EquipmentListMetadataResponse | undefined;
  pmRequest: PMRequestModal = {
    attachments: [],
    pmRequests: []
  };
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
  isMultiSelecteEnabled = false;
  pmRequestForm: FormGroup | undefined;
  email = this.userService.getUserDetails()?.email;
  selectedEquipmentColumns: Array<ColumnDefs> = PM_REQUEST_EQUIPLIST as Array<ColumnDefs>
  selectedEquipmentRows: PMEquipModal[] = [];
  selectedEquipmentSettings: TableSettings = { expandable: false, selectable: false, pagination: false };
  attachmentList: Attachment[] = [];
  attachmentListColumns: Array<ColumnDefs> = ATTACHMENT_LIST as Array<ColumnDefs>
  attachmentListSettings: TableSettings = { expandable: false, selectable: false, pagination: false };
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private requestService: RequestService,
    private loader: LoaderService,
    private notification: NotificationService,
    private billingId: BillingIdService,
    private crypto: CryptoService,
    private attachmentService: AttachmentService,
    private alert: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getBillingId();
    this.navCheck();
  }
  navCheck(): void {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      first(),
    ).subscribe((data => {
      if (data.url !== '/dashboard/service-request') {
        this.requestService.setSelectedEquipmentsToCreateRequest([]);
      }
    }));
  }
  populatepmRequestForm(): void {
    this.pmRequestForm = this.formBuilder.group({
      contactName: [`${this.userService.getUserDetails()?.userFName} ${this.userService.getUserDetails()?.userLName}`, Validators.required],
      contactPhones: [this.userService.getUserDetails()?.mobileNo, Validators.required],
      poNumber: '',
      requestDesc: '',
      contactEmails: [this.userService.getUserDetails()?.email, [Validators.required]],
      requestforUserCode: this.userService.getUserDetails()?.userCode,
      userName: `${this.userService.getUserDetails()?.userFName} ${this.userService.getUserDetails()?.userLName}`,
      userPhone: this.userService.getUserDetails()?.mobileNo,
      platform: 'WEB',
      serviceType: '1',
      requestType: 'MHSPMR',
      param1: this.crypto.getEncryptedValue(this.userService.getUserDetails()?.email || ''),
      userCode: this.userService.getUserDetails()?.userCode,
      userType: this.userService.getUserDetails()?.userType
    });
    if (this.selectedEquipmentRows.length > 1) {
      this.isMultiSelecteEnabled = true;
    } else {
      this._createSinglePMRequestControls();
      this.pmRequestForm?.get('equipSrNo')?.setValue(this.selectedEquipmentRows[0]?.equipSrNo, { emitEvent: false });
      this.pmRequestForm?.get('equipUnitNo')?.setValue(this.selectedEquipmentRows[0]?.equipUnitNo, { emitEvent: false });
      this.pmRequestForm?.get('equipMake')?.setValue(this.selectedEquipmentRows[0]?.equipMake, { emitEvent: false });
      this.pmRequestForm?.get('equipModel')?.setValue(this.selectedEquipmentRows[0]?.equipModel, { emitEvent: false });
      this.pmRequestForm?.get('equipLocation')?.setValue(this.selectedEquipmentRows[0]?.equipLocation, { emitEvent: false });
      this.pmRequestForm?.get('billTo')?.setValue(this.selectedEquipmentRows[0]?.billTo, { emitEvent: false });
      this.pmRequestForm?.get('shipTo')?.setValue(this.selectedEquipmentRows[0]?.shipTo, { emitEvent: false });
      this.pmRequestForm?.get('companyName')?.setValue(this.selectedEquipmentRows[0]?.companyName, { emitEvent: false });

      // this.selectedEquipmentRows = [];
      this.onValueChanges();
    }
    this.attachmentList = [];
  }
  private _createSinglePMRequestControls(): void {
    this.isMultiSelecteEnabled = false;
    this.pmRequestForm?.addControl('equipSrNo', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('equipUnitNo', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('equipMake', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('equipModel', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('equipLocation', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('billTo', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('shipTo', this.formBuilder.control('', Validators.required));
    this.pmRequestForm?.addControl('companyName', this.formBuilder.control('', Validators.required));
  }
  onValueChanges(): void {
    this.pmRequestForm?.get('equipSrNo')?.valueChanges.pipe(
      takeUntil(this.unSubscribe$),
    ).subscribe(val => {
      this.findEquipment(val, null);
    });
    this.pmRequestForm?.get('equipUnitNo')?.valueChanges.pipe(
      takeUntil(this.unSubscribe$),
    ).subscribe(val => {
      this.findEquipment(null, val);
    });
  }
  findEquipment(equipSrNo?: string | null, equipUnitNo?: string | null): void {
    if (equipSrNo || equipUnitNo) {
      this.equipmetMetadata?.equipmentList.forEach(data => {
        if (equipSrNo === data.equipSerialNo || equipUnitNo === data.unitNo) {
          this.pmRequestForm?.get('equipSrNo')?.setValue(data.equipSerialNo, { emitEvent: false });
          this.pmRequestForm?.get('equipUnitNo')?.setValue(data.unitNo, { emitEvent: false });
          this.pmRequestForm?.get('equipMake')?.setValue(data.equipMake, { emitEvent: false });
          this.pmRequestForm?.get('equipModel')?.setValue(data.equipModel, { emitEvent: false });
          this.pmRequestForm?.get('equipLocation')?.setValue(data.location, { emitEvent: false });
          this.pmRequestForm?.get('billTo')?.setValue(data.billTo, { emitEvent: false });
          this.pmRequestForm?.get('shipTo')?.setValue(data.shipTo, { emitEvent: false });
          this.pmRequestForm?.get('companyName')?.setValue(data.company, { emitEvent: false });
        }
      });
    } else {
      this.pmRequestForm?.get('equipSrNo')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('equipUnitNo')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('equipMake')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('equipModel')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('equipLocation')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('billTo')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('shipTo')?.setValue('', { emitEvent: false });
      this.pmRequestForm?.get('companyName')?.setValue('', { emitEvent: false });
    }

  }

  onReset(): void {
    // this.selectedEquipmentRows = [];
    this.attachmentList = [];
    this.populatepmRequestForm();
    this.pmRequestForm?.get('contactPhones')?.setValue(this.userService.getUserDetails()?.mobileNo);
  }
  submitPMRequest(): void {
    if (this._pmRequestFormValidity()) {
      this.pmRequest.pmRequests = [];
      this.loader.show();
      if (this.selectedEquipmentRows.length > 0) {
        this.selectedEquipmentRows.forEach(element => {
          this.pmRequest.pmRequests.push({ ...this.pmRequestForm?.value,
          contactEmails: (this.pmRequestForm?.value.contactEmails?.trim())?.replace(/\s\s+/g, ',')?.replace(/\n+/g, ',').replace(',,', ','),
            ...element });
        });
      } else {
        this.pmRequest.pmRequests.push({ ...this.pmRequestForm?.value,
           contactEmails: (this.pmRequestForm?.value.contactEmails?.trim())?.replace(/\s\s+/g, ',')?.replace(/\n+/g, ',').replace(',,', ',')
          });
      }
      this.pmRequest.attachments = [...this.attachmentList];
      this.requestService.createPMRequest(this.pmRequest).pipe(
        takeUntil(this.unSubscribe$),
        finalize(() => this.loader.hide())
      ).subscribe(res => {
        if (res.returnCode === 0) {
          this.selectedEquipmentRows = [];
          this.requestService.setSelectedEquipmentsToCreateRequest([]);
          this.populatepmRequestForm();
          this.pmRequestForm?.get('contactPhones')?.setValue(this.userService.getUserDetails()?.mobileNo);
          this.notification.showNotification(res.returnMsg);
        } else {
          this.notification.showNotification(res.returnMsg);
        }
      });

    }
  }
  private _isValidMobileNo(): boolean {
    const mobileNo = this.pmRequestForm?.value.contactPhones;
    const mobRegEx = new RegExp(/\w*\d/g);
    const isValidMobRegEx = mobRegEx.test(mobileNo);
    const isValidNo = mobileNo.toString().length < 21;
    return isValidMobRegEx && isValidNo;
  }
  private _isValidEmails(): boolean {
    const emails = (this.pmRequestForm?.value.contactEmails?.trim())?.replace(/\s\s+/g, ',')?.replace(/\n+/g, ',').replace(',,', ',');
    // const emails = this.pmRequestForm?.value.contactEmails;
    const regex = /^(,?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/gi;
    return regex.test(emails);
  }
  private _pmRequestFormValidity(): boolean {
    if (!this.pmRequestForm?.valid) {
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
      this.selectedEquipmentRows = [];
      if (this.equipmetMetadata.returnCode === 0) {
        const serialList: DropDownData[] = [];
        const unitNoList: DropDownData[] = [];
        this.equipmetMetadata.equipmentList.forEach(data => {
          serialList.push({ key: data.equipSerialNo, value: data.equipSerialNo });
          unitNoList.push({ key: data.unitNo, value: data.unitNo });
          this.requestService.getSelectedEquipmentsToCreateRequest().forEach(element => {
            if (data.equipSerialNo === element) {
              this.selectedEquipmentRows.push({
                billTo: data.billTo,
                equipLocation: data.location,
                equipMake: data.equipMake,
                equipModel: data.equipModel,
                equipSrNo: data.equipSerialNo,
                equipUnitNo: data.unitNo,
                shipTo: data.shipTo,
                companyName: data.company,
                remove: 'Remove'
              });
            }
          });
        });
        this.serialNoDd = { ...this.serialNoDd, data: [...serialList] };
        this.unitNoDd = { ...this.unitNoDd, data: [...unitNoList] };
        if (this.selectedEquipmentRows.length > 1) {
          this.requestService.setSelectedEquipmentsToCreateRequest([]);
        }
      } else {
        this.notification.showNotification(this.equipmetMetadata.returnMsg);
      }
      this.populatepmRequestForm();
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

  deleteEquipment(index: number): void {
    this.selectedEquipmentRows.splice(index, 1);
    this.selectedEquipmentRows = [...this.selectedEquipmentRows];
    if (this.selectedEquipmentRows.length === 0) {
      this.populatepmRequestForm();
      this.pmRequestForm?.get('contactPhones')?.setValue(this.userService.getUserDetails()?.mobileNo);
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
  deleteAttachment(index: number): void {
    this.attachmentList.splice(index, 1);
    this.attachmentList = [...this.attachmentList];
  }

  private _checkFormDirty(): boolean {
    return this.pmRequestForm?.dirty || !!this.attachmentList.length || !!this.selectedEquipmentRows.length;
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
