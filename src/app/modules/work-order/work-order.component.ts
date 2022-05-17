import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { SearchInput } from '../shared/components/search/search.interface';
import { ColumnDefs, TableSettings } from '../shared/components/table/table.interface';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { SORT_KEY } from '../shared/constants/sortkey.constant';
import { WOSTATUS } from '../shared/constants/style.constant';
import { DASHBOARD_WO_COLUMNS } from '../shared/constants/table.constant';
import { URLS } from '../shared/constants/url.constants';
import { LocationList } from '../shared/interfaces/equipment.interface';
import { WorkOrder, WorkOrderListRequest, WorkOrderListSearch, WorkOrderStatus } from '../shared/interfaces/workOrder.interface';
import { EquipmentService } from '../shared/services/equipment.service';
import { UserService } from '../shared/services/user.service';
import { UtlilityService } from '../shared/services/utlility.service';
import { WorkOrderService } from '../shared/services/work-order.service';
import { DEFAULT_ROWS_PER_PAGE, Pagination, PagionationOffset } from './../shared/components/table/pagination/pagination.interface';
import { TableSort } from './../shared/components/table/table.interface';
import { WorkOrderSearch } from './../shared/constants/searchTab.constant';
import { BillingIdService } from './../shared/services/billing-id.service';
import { LoaderService } from './../shared/services/loader.service';
import { NotificationService } from './../shared/services/notification.service';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss']
})
export class WorkOrderComponent implements OnInit, OnDestroy {
  woStatusStyle: any = WOSTATUS;
  settings: TableSettings = { pagination: true };
  offset: PagionationOffset = { limitList: DEFAULT_ROWS_PER_PAGE, offsetList: 0 };
  pagination: Pagination = { page: 1, totalCount: 0 };
  totalRows: number | undefined;
  workOrderList: WorkOrder[] = [];
  woStatus: WorkOrderStatus[] = [];
  private woStatusId = ''
  private selectedWoStatus: string[] = [];
  searchData: WorkOrderListSearch | undefined = {
    equipSRNO: null, fromDate: null, toDate: null, woID: null, woStatus: [], location: [], isPM: 2
  };
  private unSubscribe$ = new Subject();
  columns: Array<ColumnDefs> = DASHBOARD_WO_COLUMNS as Array<ColumnDefs>;
  rows = [];
  searchInput: Array<SearchInput> = new WorkOrderSearch().tab as Array<SearchInput>;
  woPdfBaseUrl = this.user.getUserDetails()?.woPdfPath;
  locations: LocationList[] = [];
  selectedWOMetadata: any = null;
  private orderBy: string = SORT_KEY.workListSorting;
  private searched = false;
  private sorted = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private billingId: BillingIdService,
    private loader: LoaderService,
    private workOrderService: WorkOrderService,
    private notification: NotificationService,
    private utility: UtlilityService,
    private equipmentService: EquipmentService,
    private user: UserService
  ) { }
  ngOnInit(): void {
    this.selectedWOMetadata = this.workOrderService.getWoSelectedMetadata();
    const { woStatus } = this.activatedRoute.snapshot.queryParams;
    this.woStatusId = woStatus;
    if (this.woStatusId) {
      this.selectedWoStatus = woStatus ? [woStatus] : [];
      this.searchInput[6].value = this.selectedWOMetadata?.woType ?? 2;
      (this.searchData as WorkOrderListSearch).isPM = this.selectedWOMetadata?.woType ?? 2;
      this.searchInput = JSON.parse(JSON.stringify(this.searchInput));
      (this.searchData as WorkOrderListSearch).location = this.selectedWOMetadata?.location || [];
    }
    this.getBillingId();
  }
  _initData(): void {
    this._getWorkOrderListsAndLocation(false, true).subscribe(data => this._handleApiResponse(data, false));
  }
  private _handleApiResponse(response: any, onlyList: boolean): void {
    // this.workOrderList = response;
    if (!onlyList) {
      this.workOrderList = response[0];
      this.locations = response[1];
      const locationKeyValue = this.locations.map(({ location, shipTo }) => ({ key: shipTo, value: location }));
      if (this.searchInput[5].metadata) {
        this.searchInput[5].metadata.data = locationKeyValue;
      }
      if (this.woStatusId) {
        this.searchInput[5].value = this.selectedWOMetadata?.location || [];
        this.woStatusId = '';
      } else {
        this.searchInput[5].value = this.locations.map(({ shipTo }) => shipTo);
      }
      this.searchInput = JSON.parse(JSON.stringify(this.searchInput));
    } else {
      this.workOrderList = response;
    }
  }
  private forkedLocationAndLists(billingId: string[], offset: PagionationOffset): Observable<Array<any>> {
    const forkedData = [this._workOrderListsData(billingId, offset), this._getLocationMetaData(billingId)];
    return forkJoin(forkedData);
  }
  private _getWorkOrderListsAndLocation(getOnlyList: boolean, resetOffset?: boolean): Observable<any> {
    return this.billingId.getBillingId().pipe(
      filter(ids => !!ids.length),
      tap(() => {
        if (!this.woStatusId && !this.searched && !this.sorted) {
          this.searchData = undefined;
          this._resetSearchForm();
        }
        if (resetOffset) {
          this.offset = { ...this.offset, offsetList: 0 };
        }
      }),
      switchMap(billingId => getOnlyList ?
        this._workOrderListsData(billingId, this.offset) :
        this.forkedLocationAndLists(billingId, this.offset)),
      takeUntil(this.unSubscribe$)
    );
  }
  private _getWorkOrders(resetPagination: boolean): void {
    this._getWorkOrderListsAndLocation(true, resetPagination).pipe(
      take(1)
    ).subscribe(data => this._handleApiResponse(data, true));
  }
  private _generateWorkOrderListModel(
    billingId: string[],
    limitList: number,
    offsetList: number): WorkOrderListRequest {
    return {
      billingId,
      woStatus: this.searchData?.woStatus?.length ? this.searchData.woStatus : this.selectedWoStatus,
      equipSRNO: this.searchData?.equipSRNO || null,
      woID: this.searchData?.woID || null,
      toDate: this.searchData?.toDate ? new Date(this.searchData.toDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null,
      fromDate: this.searchData?.fromDate ? new Date(this.searchData.fromDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null,
      location: this.searchData?.location || [],
      isPM: this.searchData?.isPM ?? 2,
      limitList,
      offsetList,
      orderBy: this.orderBy
    };
  }
  private _workOrderListsData(billingId: string[], offset: PagionationOffset): Observable<WorkOrder[]> {
    this.loader.show();
    const payLoad = this._generateWorkOrderListModel(billingId, offset.limitList, offset.offsetList);
    this.selectedWoStatus = [];
    return this.workOrderService.getWorkOrderList(payLoad).pipe(
      map(({ returnCode, wolist, totalRows }) => {
        if (returnCode === 0) {
          if (+totalRows !== this.totalRows || this.searched || this.sorted) {
            this.searched = false;
            this.sorted = false;
            this.totalRows = +totalRows;
            this.pagination = { page: 1, totalCount: this.totalRows };
          }
          return wolist;
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
    this._getWorkOrders(false);
  }
  private _validateSearchForm(value: WorkOrderListSearch): boolean {
    const isValid = Object.values(value).some(item => item ?? (!Array.isArray(item) || item.length));
    if (!isValid) {
      this.notification.showNotification(NOTIFICATION_MSG.searchFormNotValid);
      return false;
    }
    // if(value.toDate && !value.fromDate){
    //   this.notification.showNotification(NOTIFICATION_MSG.yearNotValid);
    //     return false;
    // }
    if (value.toDate && value.fromDate) {
      if (this.utility.checkFromGreaterThanToDates(value.fromDate, value.toDate)) {
        this.notification.showNotification(NOTIFICATION_MSG.dateValidation);
        return false;
      }
    }
    return true;
  }
  onSearch(value: WorkOrderListSearch): void {
    if (this._validateSearchForm(value)) {
      this.searched = true;
      this.searchData = { ...value };
      this._getWorkOrders(true);
    }
  }
  onSearchClear(): void {
    const isNotEmptySearchForm = !!this.searchData
      && Object.values(this.searchData).some(value => value ?? (!Array.isArray(value) || value.length));
    if (isNotEmptySearchForm) {
      this._resetSearchForm();
      this._getWorkOrders(true);
    }
  }
  private _resetSearchForm(): void {
    this.searched = true;
    this.searchData = { equipSRNO: null, fromDate: null, toDate: null, woID: null, woStatus: [], location: [], isPM: 2 };
    this.searchInput[6].value = 2;
    this.searchInput[5].value = this.locations.map(({ shipTo }) => shipTo);
    this.searchInput[4].value = [];
    this.searchInput = JSON.parse(JSON.stringify(this.searchInput));
  }
  onSortChange({ orderBy, order }: TableSort): void {
    this.sorted = true;
    const sortKey = this.columns.find(({ field }) => field === orderBy)?.sortKey || '';
    this.orderBy = `${sortKey} ${order}`;
    this._getWorkOrders(true);
  }
  navToEquipmentDetails(serialNo: string): void {
    if (serialNo) {
      this.router.navigate([`equipments/${serialNo}`]);
    }
  }

  public getBillingId(): void {
    const { id } = this.billingId.restoreSelectedBillingId();
    if (id) {
      this.getInvoiceDepartmentMetadata(id);
    }
  }

  public getInvoiceDepartmentMetadata(billingId: string[]): void {
    this.loader.show();
    const workOrderMetadaRequest = {
      billingId
    };
    this.workOrderService.getWorkOrderStatusMetadata(workOrderMetadaRequest).subscribe(res => {
      this.loader.hide();
      this.woStatus = res.metadata;
      const woStatusKeyValue = this.woStatus.map(({ keyField, valueField }) => ({ key: keyField, value: valueField }));
      if (this.searchInput[4].metadata) {
        (this.searchData as WorkOrderListSearch).woStatus = this.woStatusId ? [this.woStatusId] : [];
        this.searchInput[4].metadata.data = woStatusKeyValue;
        this.searchInput[4].value = this.woStatusId ? [this.woStatusId] : [];
      }
      this.searchInput = JSON.parse(JSON.stringify(this.searchInput));
      this._initData();
    }, () => this.loader.hide());
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
