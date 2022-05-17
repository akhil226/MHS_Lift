import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { SearchInput } from '../shared/components/search/search.interface';
import { ColumnDefs, TableSettings } from '../shared/components/table/table.interface';
import { AUTHKEY } from '../shared/constants/auth.constant';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { SORT_KEY } from '../shared/constants/sortkey.constant';
import { PM_LIST_COLUMNS } from '../shared/constants/table.constant';
import { PMWorkOrder, PMWorkOrderListRequest, PMWorkOrderListSearch } from '../shared/interfaces/pmWorkOrder.interface';
import { PmWorkOrderService } from '../shared/services/pm-work-order.service';
import { UserService } from '../shared/services/user.service';
import { DEFAULT_ROWS_PER_PAGE, Pagination, PagionationOffset } from './../shared/components/table/pagination/pagination.interface';
import { ExpColumDef, TableSort } from './../shared/components/table/table.interface';
import { PmListSearch } from './../shared/constants/searchTab.constant';
import { PM_LIST_EXP_COLUMNS } from './../shared/constants/table.constant';
import { LocationList } from './../shared/interfaces/equipment.interface';
import { BillingIdService } from './../shared/services/billing-id.service';
import { EquipmentService } from './../shared/services/equipment.service';
import { LoaderService } from './../shared/services/loader.service';
import { NotificationService } from './../shared/services/notification.service';
import { URLS } from '../shared/constants/url.constants';
import { AlertService } from '../shared/services/alert.service';
import { ALERT } from '../shared/constants/alert.constant';
import { RequestService } from '../shared/services/request.service';

@Component({
  selector: 'app-preventive-maintenance',
  templateUrl: './preventive-maintenance.component.html',
  styleUrls: ['./preventive-maintenance.component.scss']
})
export class PreventiveMaintenanceComponent implements OnInit, OnDestroy {
  isAdmin: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  isPmRequestEnabled = this.isAdmin ||
    this.user.getUserDetails()?.userPreAccess[5]?.adminMenuStatus === 'A' &&
    this.user.getUserDetails()?.userPreAccess[5]?.menuStatus === 'A' ? true : false;
  settings: TableSettings = { pagination: true, selectable: this.isPmRequestEnabled, expandable: true };
  offset: PagionationOffset = { limitList: DEFAULT_ROWS_PER_PAGE, offsetList: 0 };
  pagination: Pagination = { page: 1, totalCount: 0 };
  totalRows: number | undefined;
  pmList: PMWorkOrder[] = [];
  locations: LocationList[] = [];
  searchData: PMWorkOrderListSearch | undefined;
  private unSubscribe$ = new Subject();
  columns: Array<ColumnDefs> = PM_LIST_COLUMNS as Array<ColumnDefs>;
  expColumns: Array<ExpColumDef> = PM_LIST_EXP_COLUMNS;
  rows = [];
  search: Array<SearchInput> = new PmListSearch().tab as Array<SearchInput>;
  woPdfBaseUrl =this.user.getUserDetails()?.woPdfPath;
  selectedEquipmentList: PMWorkOrder[] = [];
  private searched = false;
  private sorted = false;
  private orderBy: string = SORT_KEY.pmListSorting;
  constructor(
    private router: Router,
    private billingId: BillingIdService,
    private equipmentService: EquipmentService,
    private pmService: PmWorkOrderService,
    private loader: LoaderService,
    private user: UserService,
    private notification: NotificationService,
    private alert: AlertService,
    private requestService: RequestService
  ) { }
  ngOnInit(): void {
    this._initData();
  }
  _initData(): void {
    this._getPmListsAndLocation(false, true).subscribe(data => this._handleApiResponse(data, false));
  }
  private _handleApiResponse(response: any, onlyList: boolean): void {
    if (!onlyList) {
      this.pmList = response[0];
      this.locations = response[1];
      const locationKeyValue = this.locations.map(({ location, shipTo }) => ({ key: shipTo, value: location }));
      if (this.search[4].metadata) {
        this.search[4].metadata.data = locationKeyValue;
      }
      this.search[4].value = this.locations.map(({ shipTo }) => shipTo);
      this.search = JSON.parse(JSON.stringify(this.search));
    } else {
      this.pmList = response;
    }
  }
  private forkedLocationAndLists(billingId: string[], offset: PagionationOffset): Observable<Array<any>> {
    const forkedData = [this._pmListsData(billingId, offset), this._getLocationMetaData(billingId)];
    return forkJoin(forkedData);
  }
  private _getPmListsAndLocation(getOnlyPmList: boolean, resetOffset?: boolean): Observable<any> {
    return this.billingId.getBillingId().pipe(
      filter(ids => !!ids.length),
      tap(() => {
        if (!getOnlyPmList) {
          this.searchData = undefined;
        }
        if (resetOffset) {
          this.offset = { ...this.offset, offsetList: 0 };
        }
      }),
      switchMap(billingId => getOnlyPmList ?
        this._pmListsData(billingId, this.offset) :
        this.forkedLocationAndLists(billingId, this.offset)),
      takeUntil(this.unSubscribe$)
    );
  }
  private _getPmLists(resetPagination: boolean): void {
    this._getPmListsAndLocation(true, resetPagination).pipe(
      take(1)
    ).subscribe(data => this._handleApiResponse(data, true));
  }
  private _generatePmListModel(
    billingId: string[],
    limitList: number,
    offsetList: number): PMWorkOrderListRequest {
    return {
      billingId,
      equipMfr: this.searchData?.equipMfr || null,
      equipProdId: this.searchData?.equipProdId || null,
      equipSRNO: this.searchData?.equipSRNO || null,
      equipUnitNo: this.searchData?.equipUnitNo || null,
      location: this.searchData?.location || [],
      limitList,
      offsetList,
      orderBy: this.orderBy
    };
  }
  private _pmListsData(billingId: string[], offset: PagionationOffset): Observable<PMWorkOrder[]> {
    this.loader.show();
    const payLoad = this._generatePmListModel(billingId, offset.limitList, offset.offsetList);
    return this.pmService.getPMWorkOrderList(payLoad).pipe(
      map(({ returnCode, pmwolist, totalRows }) => {
        if (returnCode === 0) {
          if (+totalRows !== this.totalRows || this.searched || this.sorted) {
            this.searched = false;
            this.sorted = false;
            this.totalRows = +totalRows;
            this.pagination = { page: 1, totalCount: this.totalRows };
          }
          return pmwolist;
        }
        return [];
      }),
      catchError(() => {
        this.searched = false;
        this.sorted = false;
        return of([]);
      }),
      finalize(() => this.loader.hide())
    );
  }
  private _getLocationMetaData(billingId: string[]): Observable<LocationList[]> {
    return this.equipmentService.getLocationMetadata({ billingId }).pipe(
      catchError(() => of([]))
    );
  }
  onPageChange(offset: PagionationOffset): void {
    this.offset = offset;
    this._getPmLists(false);
  }
  private _validateSearchForm(value: PMWorkOrderListSearch): boolean {
    const isValid = Object.values(value).some(item => item && (!Array.isArray(item) || item.length));
    if (!isValid) {
      this.notification.showNotification(NOTIFICATION_MSG.searchFormNotValid);
      return false;
    }
    return true;
  }
  onSearch(value: PMWorkOrderListSearch): void {
    if (this._validateSearchForm(value)) {
      this.searched = true;
      this.searchData = { ...value };
      this._getPmLists(true);
    }
  }
  onSearchClear(): void {
    const isNotEmptySearchForm = !!this.searchData
      && Object.values(this.searchData).some(value => value && (!Array.isArray(value) || value.length));
    if (isNotEmptySearchForm) {
      this.searched = true;
      this.searchData = undefined;
      this.search[4].value = this.locations.map(({ shipTo }) => shipTo);
      this.search = JSON.parse(JSON.stringify(this.search));
      this._getPmLists(true);
    }
  }
  onSortChange({ orderBy, order }: TableSort): void {
    this.sorted = true;
    const sortKey = this.columns.find(({ field }) => field === orderBy)?.sortKey || '';
    this.orderBy = `${sortKey} ${order}`;
    this._getPmLists(true);
  }
  navToEquipmentDetails(serialNo: string): void {
    if (serialNo) {
      this.router.navigate([`equipments/${serialNo}`]);
    }
  }
  getSelectedPM(data: PMWorkOrder[]): void {
    this.selectedEquipmentList = data;
  }

  goToPMCreate(): void {
    const equipments: string[] = [];
    this.selectedEquipmentList.forEach(data => {
      equipments.push(data.equipmentSerialNo);
    });
    const equipmentList = [...new Set(equipments)];
    this.requestService.setSelectedEquipmentsToCreateRequest(equipmentList);
    this.router.navigateByUrl('/dashboard/pm-request');

  }

  public openWOPdf(path: string): void {
    if (path) {
      window.open(this.woPdfBaseUrl + (path.startsWith('/') ? path : `/${path}`), '_blank');
    } else {
      this.notification.showNotification(NOTIFICATION_MSG.woPdfValidationMSG);
    }
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
