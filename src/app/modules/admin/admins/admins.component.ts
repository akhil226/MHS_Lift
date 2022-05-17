import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { SORT_KEY } from '../../shared/constants/sortkey.constant';
import { SearchInput } from './../../shared/components/search/search.interface';
import { DEFAULT_ROWS_PER_PAGE, Pagination, PagionationOffset } from './../../shared/components/table/pagination/pagination.interface';
import { ColumnDefs, TableSettings } from './../../shared/components/table/table.interface';
import { AUTHKEY } from './../../shared/constants/auth.constant';
import { NOTIFICATION_MSG } from './../../shared/constants/notification.constant';
import { AdminSearch } from './../../shared/constants/searchTab.constant';
import { ADMIN_LIST_COLUMNS } from './../../shared/constants/table.constant';
import { LoaderService } from './../../shared/services/loader.service';
import { NotificationService } from './../../shared/services/notification.service';
import { CustomerListReq, UserList, UserSearch, UserStatusUpdateReq } from './../customers/customer.interface';
import { CustomerService } from './../customers/customer.service';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit, OnDestroy {
  settings: TableSettings = { pagination: true, localSort: true };
  pagination: Pagination = { page: 1, totalCount: 0 };
  search: Array<SearchInput> = new AdminSearch().tab as Array<SearchInput>;
  columns: Array<ColumnDefs> = ADMIN_LIST_COLUMNS as Array<ColumnDefs>;
  userData: UserList[] = [];
  private searchData: UserSearch | null = null;
  private totalRows: number | undefined;
  private offset: PagionationOffset = { limitList: DEFAULT_ROWS_PER_PAGE, offsetList: 0 };
  private unSubscribe$ = new Subject();
  constructor(
    private router: Router,
    private customerService: CustomerService,
    private loader: LoaderService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this._getUserLisitng();
  }
  private _generateEquipmentListModel(): CustomerListReq {
    const { limitList, offsetList } = this.offset;
    return {
      limitList, offsetList,
      listUsertype: AUTHKEY.ADMIN,
      orderBy: SORT_KEY.cutomerListSorting,
      searchUserEmail: this.searchData?.searchUserEmail || null,
      searchUserJobDesign: this.searchData?.searchUserJobDesign || null,
      searchUserName: this.searchData?.searchUserName || null,
      searchUserStatus: this.searchData?.searchUserStatus?.[0] || null,
      searchBillTo:this.searchData?.searchBillTo ||null
    };
  }
  private _getUserLisitng(): void {
    this.loader.show();
    const payload = this._generateEquipmentListModel();
    this.customerService.getUsersList(payload).pipe(
      map(({ returnCode, userLists, totalRows }) => {
        if (returnCode === 0 && userLists.length) {
          if (+totalRows !== this.totalRows) {
            this.totalRows = +totalRows;
            this.pagination = { page: 1, totalCount: this.totalRows };
          }
          return userLists.map(data => ({ ...data, edit: 'edit', activate: 'activate' }));
        }
        return [];
      }),
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(userList => this.userData = userList);
  }
  trackByIndex(index: number): number {
    return index;
  }
  onActivationChange(index: number, { listUserCode, listUserStatus }: UserList): void {
    this.loader.show();
    const changeStatusTo = listUserStatus === 'A' ? 'I' : 'A';
    const payload: UserStatusUpdateReq = { changeStatusTo, userCodeForStatus: listUserCode };
    this.customerService.updateUserStatus(payload).pipe(
      takeUntil(this.unSubscribe$),
      finalize(() => this.loader.hide())
    ).subscribe(({ returnCode, returnMsg }) => {
      this.notification.showNotification(returnMsg);
      if (returnCode === 0) {
        this.userData = this.userData.map(((data, i) => {
          if (i === index) {
            data.listUserStatus = changeStatusTo;
          }
          return data;
        }));
      } else {
        this.userData = [...this.userData];
      }
    }, () => this.userData = [...this.userData]
    );
  }
  onPageChange(offset: PagionationOffset): void {
    this.offset = offset;
    this._getUserLisitng();
  }
  private _validateSearchForm(value: UserSearch): boolean {
    const isValid = Object.values(value).some(item => item && (!Array.isArray(item) || item.length));
    if (!isValid) {
      this.notification.showNotification(NOTIFICATION_MSG.searchFormNotValid);
      return false;
    }
    return true;
  }
  onSearch(value: UserSearch): void {
    if (this._validateSearchForm(value)) {
      this.searchData = { ...value };
      this._getUserLisitng();
    }
  }
  onSearchClear(): void {
    const isNotEmptySearchForm = !!this.searchData &&
    Object.values(this.searchData).some(value => value && (!Array.isArray(value) || value.length));
    if (isNotEmptySearchForm) {
      this.searchData = null;
      this._getUserLisitng();
    }
  }
  navToEdit({ listUserCode }: UserList): void {
    this.router.navigateByUrl(`admin/edit/${listUserCode}`);
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
