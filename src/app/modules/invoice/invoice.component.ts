import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Dropdown } from 'src/app/modules/shared/components/multiselect/dropdown.interface';
import { SearchInput } from '../shared/components/search/search.interface';
import { ColumnDefs, ExpColumDef, TableSettings } from '../shared/components/table/table.interface';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { SORT_KEY } from '../shared/constants/sortkey.constant';
import { INVOICE_EXP_COLUMNS, INVOICE_LIST_COLUMNS } from '../shared/constants/table.constant';
import { DepartmentList, Invoice, InvoiceListReq, InvoiceListSearch } from '../shared/interfaces/invoice.interface';
import { InvoiceService } from '../shared/services/invoice.service';
import { UserService } from '../shared/services/user.service';
import { DEFAULT_ROWS_PER_PAGE, Pagination, PagionationOffset } from './../shared/components/table/pagination/pagination.interface';
import { TableSort } from './../shared/components/table/table.interface';
import { InvoiceListSearchTab } from './../shared/constants/searchTab.constant';
import { LocationList } from './../shared/interfaces/equipment.interface';
import { InvoicePdfDownload } from './../shared/interfaces/invoice.interface';
import { BillingIdService } from './../shared/services/billing-id.service';
import { EquipmentService } from './../shared/services/equipment.service';
import { LoaderService } from './../shared/services/loader.service';
import { NotificationService } from './../shared/services/notification.service';
import { UtlilityService } from './../shared/services/utlility.service';

@Component({
  selector: 'app-inovice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, OnDestroy {
  settings: TableSettings = { pagination: true, expandable: true, selectable: true };
  offset: PagionationOffset = { limitList: DEFAULT_ROWS_PER_PAGE, offsetList: 0 };
  pagination: Pagination = { page: 1, totalCount: 0 };
  totalRows: number | undefined;
  invoiceLists: Invoice[] = [];
  locations: LocationList[] = [];
  departments: DepartmentList[] = [];
  searchData: InvoiceListSearch | undefined;
  private unSubscribe$ = new Subject();
  columns: Array<ColumnDefs> = INVOICE_LIST_COLUMNS as Array<ColumnDefs>;
  invoiceExpColumns: Array<ExpColumDef> = INVOICE_EXP_COLUMNS as Array<ExpColumDef>;
  rows = [];
  search: Array<SearchInput> = new InvoiceListSearchTab().tab as Array<SearchInput>;
  selectedBillingId: string[] = [];
  selectedInvoiceNumbers: string[] = [];
  private searched = false;
  private sorted = false;
  private orderBy: string = SORT_KEY.invoiceListSorting;
  woPdfBaseUrl = this.user.getUserDetails()?.woPdfPath;
  constructor(
    private router: Router,
    private billingId: BillingIdService,
    private equipmentService: EquipmentService,
    private loader: LoaderService,
    private invoiceService: InvoiceService,
    private notification: NotificationService,
    private utility: UtlilityService,
    private user: UserService
  ) { }
  ngOnInit(): void {
    this._initData();
  }
  _initData(): void {
    this._getInvoiceListsAndLocation(false, true).subscribe(data => this._handleApiResponse(data, false));
  }
  private _handleApiResponse(response: any, onlyList: boolean): void {
    if (!onlyList) {
      this.invoiceLists = response[0];
      this.locations = response[1];
      this.departments = response[2] || [];
      const locationKeyValue = this.locations.map(({ location, shipTo }) => ({ key: shipTo, value: location }));
      const departmentKeyValue = this.departments.map(({ departmentId, departmentName }) => ({ key: departmentId, value: departmentName }));
      if (this.search[5].metadata) {
        this.search[5].metadata.data = locationKeyValue;
      }
      (this.search[6].metadata as Dropdown).data = departmentKeyValue;
      this.search[6].value = this.departments.map(({ departmentId }) => departmentId);
      this.search[5].value = this.locations.map(({ shipTo }) => shipTo);
      this.search = JSON.parse(JSON.stringify(this.search));
    } else {
      this.invoiceLists = response;
    }
  }
  private forkedLocationAndLists(billingId: string[], offset: PagionationOffset): Observable<Array<any>> {
    const forkedData = [
      this._equipmentListsData(billingId, offset),
      this._getLocationMetaData(billingId),
      this._getInvoiceDepartmentMetadata(billingId)
    ];
    return forkJoin(forkedData);
  }
  private _getInvoiceListsAndLocation(getOnlyInvoiceList: boolean, resetOffset?: boolean): Observable<any> {
    return this.billingId.getBillingId().pipe(
      filter(ids => !!ids.length),
      tap(() => {
        if (!getOnlyInvoiceList) {
          this.searchData = undefined;
        }
        if (resetOffset) {
          this.offset = { ...this.offset, offsetList: 0 };
        }
      }),
      switchMap(billingId => {
        this.selectedBillingId = billingId;
        return getOnlyInvoiceList ?
          this._equipmentListsData(billingId, this.offset) :
          this.forkedLocationAndLists(billingId, this.offset);
      }),
      takeUntil(this.unSubscribe$)
    );
  }
  private _getInvoiceLists(resetPagination: boolean): void {
    this._getInvoiceListsAndLocation(true, resetPagination).pipe(
      take(1)
    ).subscribe(data => this._handleApiResponse(data, true));
  }
  private _generateInvoiceListModel(
    billingId: string[],
    limitList: number,
    offsetList: number): InvoiceListReq {
    return {

      billingId,
      location: this.searchData?.location || [],
      department: this.searchData?.department || [],
      fromDate: this.searchData?.fromDate ? new Date(this.searchData.fromDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null,
      invoiceNo: this.searchData?.invoiceNo || null,
      woID:  this.searchData?.woID || null,
      invoiceStatus: this.searchData?.invoiceStatus?.[0] || null,
      toDate: this.searchData?.toDate ? new Date(this.searchData.toDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null,
      limitList,
      offsetList,
      orderBy: this.orderBy
    };
  }
  private _equipmentListsData(billingId: string[], offset: PagionationOffset): Observable<Invoice[]> {
    this.loader.show();
    const payLoad = this._generateInvoiceListModel(billingId, offset.limitList, offset.offsetList);
    return this.invoiceService.getInvoiceList(payLoad).pipe(
      map(({ returnCode, invoiceList, totalRows }) => {
        if (returnCode === 0) {
          if (+totalRows !== this.totalRows || this.searched || this.sorted) {
            this.searched = false;
            this.sorted = false;
            this.totalRows = +totalRows;
            this.pagination = { page: 1, totalCount: this.totalRows };
          }
          return invoiceList;
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
    this._getInvoiceLists(false);
  }
  private _validateSearchForm(value: InvoiceListSearch): boolean {
    const isValid = Object.values(value).some(item => item && (!Array.isArray(item) || item.length));
    if (!isValid) {
      this.notification.showNotification(NOTIFICATION_MSG.searchFormNotValid);
      return false;
    }
    if (value.toDate && value.fromDate) {
      if (this.utility.checkFromGreaterThanToDates(value.fromDate, value.toDate)) {
        this.notification.showNotification(NOTIFICATION_MSG.dateValidation);
        return false;
      }
    }
    return true;
  }
  onSearch(value: InvoiceListSearch): void {
    if (this._validateSearchForm(value)) {
      this.searched = true;
      this.searchData = { ...value };
      this._getInvoiceLists(true);
    }
  }
  onSearchClear(): void {
    const isNotEmptySearchForm = !!this.searchData
      && Object.values(this.searchData).some(value => value && (!Array.isArray(value) || value.length));
    if (isNotEmptySearchForm) {
      this.searched = true;
      this.searchData = undefined;
      this.search[5].value = this.locations.map(({ shipTo }) => shipTo);
      this.search[6].value = this.departments.map(({ departmentId }) => departmentId);
      this.search = JSON.parse(JSON.stringify(this.search));
      this._getInvoiceLists(true);
    }
  }
  onSortChange({ orderBy, order }: TableSort): void {
    this.sorted = true;
    const sortKey = this.columns.find(({ field }) => field === orderBy)?.sortKey || '';
    this.orderBy = `${sortKey} ${order}`;
    this._getInvoiceLists(true);
  }
  navToEquipmentDetails(serialNo: string): void {
    if (serialNo) {
      this.router.navigate([`equipments/${serialNo}`]);
    }
  }
  private _getInvoiceDepartmentMetadata(billingId: string[]): Observable<DepartmentList[]> {
    return this.invoiceService.getInvoiceDepartmentMetadata({ billingId }).pipe(
      catchError(() => of([]))
    );
  }
  private _genereateInvoicePdfDownloadPayload(invoiceNumber: string[]): InvoicePdfDownload {
    return { departId: '', invoiceNumber, invoiceTotalAmt: null };
  }
  invoicePdfDownload(invoiceLists: Invoice): void {
    const invoiceNumber = [invoiceLists.invoiceNumber];
    const data = this._genereateInvoicePdfDownloadPayload(invoiceNumber);
    this.invoiceService.downloadinvoicePdf(data);
  }
  downloadSelectedInvoice(): void {
    if (this.selectedInvoiceNumbers.length) {
      const data = this._genereateInvoicePdfDownloadPayload(this.selectedInvoiceNumbers);
      this.invoiceService.downloadinvoicePdf(data);
    }
  }
  onInvoiceSelection(invoice: Invoice[]): void {
    this.selectedInvoiceNumbers = invoice.map(({ invoiceNumber }) => invoiceNumber);
  }
  downloadExcel(): void {
    const data = this._generateInvoiceListModel(this.selectedBillingId, this.offset.limitList, this.offset.offsetList);
    this.invoiceService.downloadEquipmentListReport(data);
  }
  public openWOPdf(path: string): void {
    if (path) {
      window.open(this.woPdfBaseUrl + (path.startsWith('/') ? path : `/${path}`), '_blank');
    } else {
      this.notification.showNotification(NOTIFICATION_MSG.woPdfInvoiceValidationMSG);
    }
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
