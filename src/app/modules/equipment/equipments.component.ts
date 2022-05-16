import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { SearchInput } from '../shared/components/search/search.interface';
import { ColumnDefs, TableSettings } from '../shared/components/table/table.interface';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { EquipmentListSeatch } from '../shared/constants/searchTab.constant';
import { SORT_KEY } from '../shared/constants/sortkey.constant';
import { DASHBOARD_EQUIPMENT_LIST_COLUMNS } from '../shared/constants/table.constant';
import { DEFAULT_ROWS_PER_PAGE, Pagination, PagionationOffset } from './../shared/components/table/pagination/pagination.interface';
import { TableSort } from './../shared/components/table/table.interface';
import { EquipmentList, EquipmentListReq, EquipmentListSearch, LocationList } from './../shared/interfaces/equipment.interface';
import { BillingIdService } from './../shared/services/billing-id.service';
import { EquipmentService } from './../shared/services/equipment.service';
import { LoaderService } from './../shared/services/loader.service';
import { NotificationService } from './../shared/services/notification.service';

@Component({
  selector: 'app-equipments',
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.scss']
})
export class EquipmentsComponent implements OnInit, OnDestroy {
  settings: TableSettings = { pagination: true };
  offset: PagionationOffset = { limitList: DEFAULT_ROWS_PER_PAGE, offsetList: 0 };
  pagination: Pagination = { page: 1, totalCount: 0 };
  totalRows: number | undefined;
  equipmentLists: EquipmentList[] = [];
  locations: LocationList[] = [];
  searchData: EquipmentListSearch | null = null;
  private orderBy: string = SORT_KEY.equipmentLsiting;
  private unSubscribe$ = new Subject();
  columns: Array<ColumnDefs> = DASHBOARD_EQUIPMENT_LIST_COLUMNS as Array<ColumnDefs>;
  rows = [];
  search: Array<SearchInput> = new EquipmentListSeatch().tab as Array<SearchInput>;
  selectedBillingId: string[] = [];
  private searched = false;
  private sorted = false;
  constructor(
    private router: Router,
    private billingId: BillingIdService,
    private equipmentService: EquipmentService,
    private loader: LoaderService,
    private notification: NotificationService
  ) { }
  ngOnInit(): void {
    this._initData();
  }
  _initData(): void {
    this._getEquipmentListsAndLocation(false, true).subscribe(data => this._handleApiResponse(data, false));
  }
  private _handleApiResponse(response: any, onlyList: boolean): void {
    if (!onlyList) {
      this.equipmentLists = response[0];
      this.locations = response[1];
      const locationKeyValue = this.locations.map(({ location, shipTo }) => ({ key: shipTo, value: location }));
      if (this.search[4].metadata) {
        this.search[4].metadata.data = locationKeyValue;
      }
      this.search[4].value = this.locations.map(({ shipTo }) => shipTo);
      this.search = JSON.parse(JSON.stringify(this.search));
    } else {
      this.equipmentLists = response;
    }
  }
  private forkedLocationAndLists(billingId: string[], offset: PagionationOffset): Observable<Array<any>> {
    const forkedData = [this._equipmentListsData(billingId, offset), this._getLocationMetaData(billingId)];
    return forkJoin(forkedData);
  }
  private _getEquipmentListsAndLocation(getOnlyEquipmentList: boolean, resetOffset?: boolean): Observable<any> {
    return this.billingId.getBillingId().pipe(
      filter(ids => !!ids.length),
      tap(() => {
        if (!getOnlyEquipmentList) {
          this.searchData = null;
        }
        if (resetOffset) {
          this.offset = { ...this.offset, offsetList: 0 };
        }
      }),
      switchMap(billingId => {
        this.selectedBillingId = billingId;
        return getOnlyEquipmentList ?
          this._equipmentListsData(billingId, this.offset) :
          this.forkedLocationAndLists(billingId, this.offset);
      }),
      takeUntil(this.unSubscribe$)
    );
  }
  private _getEquipmentLists(resetPagination: boolean): void {
    this._getEquipmentListsAndLocation(true, resetPagination).pipe(
      take(1)
    ).subscribe(data => this._handleApiResponse(data, true));
  }
  private _generateEquipmentListModel(
    billingId: string[],
    limitList: number,
    offsetList: number): EquipmentListReq {
    return {
      billingId,
      equipMake: this.searchData?.equipMake || null,
      equipModel: this.searchData?.equipModel || null,
      equipSerialNo: this.searchData?.equipSerialNo || null,
      equipYear: this.searchData?.equipYear || null,
      location: this.searchData?.location || [],
      limitList,
      offsetList,
      orderBy: this.orderBy
    };
  }
  private _equipmentListsData(billingId: string[], offset: PagionationOffset): Observable<EquipmentList[]> {
    this.loader.show();
    const payLoad = this._generateEquipmentListModel(billingId, offset.limitList, offset.offsetList);
    return this.equipmentService.getEquipmentLists(payLoad).pipe(
      map(({ returnCode, equipmentList, totalRows }) => {
        if (returnCode === 0) {
          if (+totalRows !== this.totalRows || this.searched || this.sorted) {
            this.searched = false;
            this.sorted = false;
            this.totalRows = +totalRows;
            this.pagination = { page: 1, totalCount: this.totalRows };
          }
          return equipmentList;
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
    this._getEquipmentLists(false);
  }
  private _validateSearchForm(value: EquipmentListSearch): boolean {
    const isValid = Object.values(value).some(item => item && (!Array.isArray(item) || item.length));
    if (!isValid) {
      this.notification.showNotification(NOTIFICATION_MSG.searchFormNotValid);
      return false;
    }
    const year = value.equipYear?.toString() || '';
    const notValidYear = year && (!Number.isInteger(+year) || !(+year > 0) || year.length !== 4);
    if (notValidYear) {
      this.notification.showNotification(NOTIFICATION_MSG.yearNotValid);
      return false;
    }
    return true;
  }
  onSearch(value: EquipmentListSearch): void {
    if (this._validateSearchForm(value)) {
      this.searched = true;
      this.searchData = { ...value };
      this._getEquipmentLists(true);
    }
  }
  onSearchClear(): void {
    const isNotEmptySearchForm = !!this.searchData &&
      Object.values(this.searchData).some(value => value && (!Array.isArray(value) || value.length));
    if (isNotEmptySearchForm) {
      this.searched = true;
      this.searchData = null;
      this.search[4].value = this.locations.map(({ shipTo }) => shipTo);
      this.search = JSON.parse(JSON.stringify(this.search));
      this._getEquipmentLists(true);
    }
  }
  onSortChange({ orderBy, order }: TableSort): void {
    this.sorted = true;
    const sortKey = this.columns.find(({ field }) => field === orderBy)?.sortKey || '';
    this.orderBy = `${sortKey} ${order}`;
    this._getEquipmentLists(true);
  }
  navToEquipmentDetails(serialNo: string): void {
    if (serialNo) {
      this.router.navigate([`equipments/${serialNo}`]);
    }
  }

  downloadExcel(): void {
    const data = this._generateEquipmentListModel(this.selectedBillingId, this.offset.limitList, this.offset.offsetList);
    this.equipmentService.downloadEquipmentListReport(data);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
