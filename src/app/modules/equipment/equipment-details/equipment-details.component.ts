import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColumnDefs, TableSettings } from '../../shared/components/table/table.interface';
import { WOSTATUS } from '../../shared/constants/style.constant';
import { EquipmentDetailsRequest, EquipmentDetailsResponse, EquipmentOpenJobsModel, EquipmentServiceHistoryModel } from '../../shared/interfaces/equipment.interface';
import { BillingIdService } from '../../shared/services/billing-id.service';
import { EquipmentService } from '../../shared/services/equipment.service';
import { LoaderService } from './../../shared/services/loader.service';
import { ServiceHistoryComponent } from './../service-history/service-history.component';
import { URLS } from '../../shared/constants/url.constants';
import { RequestService } from '../../shared/services/request.service';
import { EQUIP_DETAILS_OPENJOBS_COLUMNS, EQUIP_DETAILS_SERVICEHISTORY_COLUMNS } from '../../shared/constants/table.constant';
import { NotificationService } from '../../shared/services/notification.service';
import { NOTIFICATION_MSG } from '../../shared/constants/notification.constant';
import { UserPreAccess } from '../../login/login.interface';
import { UserService } from '../../shared/services/user.service';
import { AUTHKEY } from '../../shared/constants/auth.constant';

@Component({
  selector: 'app-equipment-details',
  templateUrl: './equipment-details.component.html',
  styleUrls: ['./equipment-details.component.scss']
})
export class EquipmentDetailsComponent implements OnInit, OnDestroy {
  woStatusStyle: any = WOSTATUS;
  private unSubscribe$ = new Subject();
  serialNuber = '';
  equipmentDetails: EquipmentDetailsResponse = {} as EquipmentDetailsResponse;
  openJobsColumns: Array<ColumnDefs> = EQUIP_DETAILS_OPENJOBS_COLUMNS as Array<ColumnDefs>;
  openJobsRows: EquipmentOpenJobsModel[] = [];
  openJobsSettings: TableSettings = { expandable: false, selectable: false, pagination: false, localSort: true };
  serviceHistoryColumns: Array<ColumnDefs> = EQUIP_DETAILS_SERVICEHISTORY_COLUMNS as Array<ColumnDefs>;
  serviceHistoryRows: EquipmentServiceHistoryModel[] = [];
  serviceHistorySettings: TableSettings = { expandable: false, selectable: false, pagination: false, localSort: true };
  woPdfBaseUrl = this.user.getUserDetails()?.woPdfPath;
  userPrivilage: UserPreAccess[] = this.user.getUserDetails()?.userPreAccess || [];
  userType: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  constructor(
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private equipmentService: EquipmentService,
    private loader: LoaderService,
    private billingId: BillingIdService,
    private router: Router,
    private user: UserService,
    private requestService: RequestService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      takeUntil(this.unSubscribe$)
    ).subscribe(res => {
      this.serialNuber = res?.get('id') || '';
      this.getBillingId();
    });
  }
  public _showServiceHistory(item: EquipmentServiceHistoryModel): Observable<any> {
    const dialogRef = this.dialog.open(ServiceHistoryComponent, {
      width: '1000px',
      //  height: '100vw',
      panelClass: 'custom-dialog-container',
      data: item
    });
    return dialogRef.afterClosed();
  }

  public getBillingId(): void {
    const { id } = this.billingId.restoreSelectedBillingId();
    if (id) {
      this.getEquipmentDetails(id);
    }
  }

  public getEquipmentDetails(billingId: string[]): void {
    this.loader.show();
    const equipDetailRequest: EquipmentDetailsRequest = {
      billingId,
      equipSerialNo: this.serialNuber
    };
    this.equipmentService.getEquipmentDetails(equipDetailRequest).pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(res => {
      this.equipmentDetails = res;
      this.serviceHistoryRows = this.equipmentDetails.equipmentServiceHistory;
      this.openJobsRows = this.equipmentDetails.equipmentopenJobs;
      if(!res.equipmentList.length){
        this.notification.emergencyServiceNotification(NOTIFICATION_MSG.equipmentDetailsValidation);
      }

    });
  }

  goToCreateRequest(data: string, type: string): void {
    this.requestService.setSelectedEquipmentsToCreateRequest([data]);
    if (type === 'PM') {
      this.router.navigateByUrl('/dashboard/pm-request');
    } else {
      this.router.navigateByUrl('/dashboard/service-request');
    }
  }

  public openWOPdf(path: string): void {
    if (path){
      window.open(this.woPdfBaseUrl + (path.startsWith('/') ? path : `/${path}`), '_blank');
    } else {
      this.notification.showNotification(NOTIFICATION_MSG.woPdfValidationMSG);
    }
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next(true);
    this.unSubscribe$.complete();
  }
}
