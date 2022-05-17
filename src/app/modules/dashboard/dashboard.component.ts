import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { merge, Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { catchError, filter, finalize, map, share, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { UserDetails, UserPreAccess } from '../login/login.interface';
import { ALERT } from '../shared/constants/alert.constant';
import { AUTHKEY } from '../shared/constants/auth.constant';
import { WOSTATUS_DATA } from '../shared/constants/drodown.constants';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { SORT_KEY } from '../shared/constants/sortkey.constant';
import { WOSTATUS, WO_STATUS_GRAPH } from '../shared/constants/style.constant';
import {
  DASHBOARD_INVOICE_COLUMNS, DASHBOARD_INVOICE_EXP_COLUMNS, DASHBOARD_PM_COLUMNS, DASHBOARD_PM_EXP_COLUMNS, DASHBOARD_WO_COLUMNS
} from '../shared/constants/table.constant';
import { URLS } from '../shared/constants/url.constants';
import { EquipmentListMetadataRequest } from '../shared/interfaces/equipment.interface';
import { Invoice, InvoiceListRequest } from '../shared/interfaces/invoice.interface';
import { PMWorkOrder, PMWorkOrderListRequest } from '../shared/interfaces/pmWorkOrder.interface';
import { UpdateUserPrevAccessRequest } from '../shared/interfaces/settings.interface';
import { WorkOrder, WorkOrderListRequest, WorkOrderStatusGraph, WorkOrderStatusGraphRequest } from '../shared/interfaces/workOrder.interface';
import { AlertService } from '../shared/services/alert.service';
import { EquipmentService } from '../shared/services/equipment.service';
import { InvoiceService } from '../shared/services/invoice.service';
import { LoaderService } from '../shared/services/loader.service';
import { NotificationService } from '../shared/services/notification.service';
import { PmWorkOrderService } from '../shared/services/pm-work-order.service';
import { SettingsService } from '../shared/services/settings.service';
import { UserService } from '../shared/services/user.service';
import { WorkOrderService } from '../shared/services/work-order.service';
import { Dropdown } from './../shared/components/multiselect/dropdown.interface';
import { ColumnDefs, ExpColumDef, TableSettings } from './../shared/components/table/table.interface';
import { LocationList } from './../shared/interfaces/equipment.interface';
import { InvoicePdfDownload } from './../shared/interfaces/invoice.interface';
import { KpiFilter, KpiReport, KpiRequest } from './../shared/interfaces/kpi.interface';
import { ServiceReportReq } from './../shared/interfaces/service-reports.interface';
import { WoStatus, WostatusMap } from './../shared/interfaces/workOrder.interface';
import { BillingIdService } from './../shared/services/billing-id.service';
import { KpiService } from './../shared/services/kpi.service';
import { ServiceDetailsService } from './../shared/services/service-details.service';
import { UtlilityService } from './../shared/services/utlility.service';
import { ExecutiveSummaryGraphComponent } from './executive-summary-graph/executive-summary-graph.component';
import { KpiFilterComponent } from './kpi-filter/kpi-filter.component';

const DEFAULT_KPI_REPORT_ID = '1';
const DEFAULT_KPI_ID = '0';
type ServiceReportForm = {
  fromDate: Date | null, toDate: Date | null,
  serialNoUnitNo: string, serviceDetailId: string, location: string[]
};
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  woPdfBaseUrl = this.user.getUserDetails()?.woPdfPath;
  woStatusStyle: any = WOSTATUS;
  woStatusGraphStyle = WO_STATUS_GRAPH;
  billingId: string[] = [];
  public loader = false;
  kpiReport$: Observable<KpiReport | undefined> = of(new KpiReport());
  kpiId = '';
  kpiReportName: string | undefined = '';
  kpiFilterData: KpiFilter = { fromDate: '', isPMWO: DEFAULT_KPI_ID, toDate: '' };
  private unSubscribe$ = new Subject();
  userData: UserDetails | null;
  eqipmentSerialNo = '';
  userPrivilage: UserPreAccess[] = this.user.getUserDetails()?.userPreAccess || [];
  isAdmin: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  colSpan = 6;
  isExecutiveSummayEnabled = true;
  selectedWoStatusGraphId = 0;
  kpiLocation: string[] = [];
  executiveSummaryLocation: string[] = [];
  woStatusGraphlocations: string[] = [];
  serviceReportLocations: string[] = [];
  dashboardData: Observable<any> = of([]);
  workOrderGraph: Observable<WorkOrderStatusGraph> | Observable<undefined> = of(new WorkOrderStatusGraph());

  woColumns: Array<ColumnDefs> = DASHBOARD_WO_COLUMNS as Array<ColumnDefs>;
  woRows: Observable<WorkOrder[] | null> = of([]);
  woSettings: TableSettings = { expandable: false, selectable: false, pagination: false, localSort: true };

  pmColumns: Array<ColumnDefs> = DASHBOARD_PM_COLUMNS as Array<ColumnDefs>;
  pmExpColumns: Array<ExpColumDef> = DASHBOARD_PM_EXP_COLUMNS as Array<ExpColumDef>;
  pmRows: Observable<PMWorkOrder[] | null> = of([]);
  pmSettings: TableSettings = { expandable: true, selectable: false, pagination: false, localSort: true };

  invoiceColumns: Array<ColumnDefs> = DASHBOARD_INVOICE_COLUMNS as Array<ColumnDefs>;
  invoiceExpColumns: Array<ExpColumDef> = DASHBOARD_INVOICE_EXP_COLUMNS as Array<ExpColumDef>;
  invoiceRows: Observable<Invoice[] | null> = of([]);
  invoiceSettings: TableSettings = { expandable: true, selectable: false, localSort: true };

  woStatusDd: Dropdown = {
    multi: false,
    placeholder: 'Select',
    data: WOSTATUS_DATA
  };
  kpiDdl: Dropdown = {
    multi: false,
    placeholder: 'Select KPI',
    data: []
  };
  reportDdl: Observable<Dropdown> | Observable<undefined> = of({
    multi: false,
    placeholder: 'Select KPI',
    allowSearchFilter: false,
    data: []
  });
  serialUnitNoDdl: Observable<Dropdown> | Observable<undefined> = of({
    multi: false,
    placeholder: 'Enter Serial #/Unit #',
    data: []
  });
  locationDdl: Observable<Dropdown> | Observable<undefined> = of({
    multi: true,
    placeholder: 'Locations',
    data: []
  });
  serviceReportForm: FormGroup = this.formBuilder.group({
    fromDate: null,
    toDate: null,
    serialNoUnitNo: '',
    serviceDetailId: ['', Validators.required],
    location: [[]]
  });
  private selectedLocations = new BehaviorSubject<{ location: string[] }>({ location: [] });
  selectedLocations$ = this.selectedLocations.asObservable();
  constructor(
    private formBuilder: FormBuilder,
    private billingIdService: BillingIdService,
    private user: UserService,
    private woService: WorkOrderService,
    private pmWoService: PmWorkOrderService,
    private invoiceService: InvoiceService,
    private equipmentService: EquipmentService,
    private alert: AlertService,
    public router: Router,
    public notificationService: NotificationService,
    private settingService: SettingsService,
    private loaderService: LoaderService,
    public dialog: MatDialog,
    private kpiService: KpiService,
    private utility: UtlilityService,
    private serviceDetailsService: ServiceDetailsService
  ) {
    this.userData = this.user.getUserDetails();
  }

  ngOnInit(): void {
    this._setDefaultKpiFilterDates();
    this._fetchKpiReportList();
    this._fetchServiceReportList();
    this.getBillingId();
    this.calculateColSpan();
  }

  private _setDefaultKpiFilterDates(): void {
    const today = new Date();
    const sevenDaysBeforeToday = this.utility.addOrSubtractDate(new Date(), -29);
    this.kpiFilterData.fromDate = sevenDaysBeforeToday.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    this.kpiFilterData.toDate = today.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  private calculateColSpan(): void {
    if (this.isAdmin || (this.userPrivilage[1]?.menuStatus === 'A' &&
      this.userPrivilage[1]?.userMenuStatus === 'A' &&
      this.userPrivilage[1]?.adminMenuStatus === 'A')
      &&
      (this.userPrivilage[0]?.menuStatus === 'A' &&
        this.userPrivilage[0]?.userMenuStatus === 'A' &&
        this.userPrivilage[0]?.adminMenuStatus === 'A')
    ) {
      this.colSpan = 6;
    } else {
      this.colSpan = 12;
    }
    if ((this.userPrivilage[1]?.menuStatus === 'I' ||
      this.userPrivilage[1]?.userMenuStatus === 'I' ||
      this.userPrivilage[1]?.adminMenuStatus === 'I')
      &&
      (this.userPrivilage[0]?.menuStatus === 'I' ||
        this.userPrivilage[0]?.userMenuStatus === 'I' ||
        this.userPrivilage[0]?.adminMenuStatus === 'I')
    ) {
      this.isExecutiveSummayEnabled = false;

    }
  }
  private _fetchServiceReportList(): void {
    this.reportDdl = this.serviceDetailsService.getServiceReports();
  }
  public equipmentSearch(serial?: string): void {
    this.router.navigate([`equipments/${serial ? serial : this.eqipmentSerialNo}`]);
  }

  public updateUserPrivilageAccess(id: any): void {
    if (!this.isAdmin) {
      const title = ALERT.dashboardMenuDeleteTitle;
      const content = ALERT.dashboardMenuDeleteMsg;
      this.alert.show({ title, content }).pipe(
        filter(value => value),
        take(1)
      ).subscribe(() => {
        this.loaderService.show();
        const request: UpdateUserPrevAccessRequest = {
          billingId: this.billingId,
          userPreAccess: [{
            menuId: id,
            status: 'I'
          }]
        };
        this.settingService.updateUserAccessPrivilages(request).pipe(
          finalize(() => this.loaderService.hide())
        ).subscribe((response) => {
          if (response.returnCode === 0) {
            this.userPrivilage[+id - 1].userMenuStatus = 'I';
            switch (+id) {
              case 1:
              case 2:
                this.calculateColSpan();
                break;
            }
            let usepreAccess = this.userData?.userPreAccess || [];
            usepreAccess = this.userPrivilage;
            this.user.setuserDetails(this.userData);
          } else {
            this.notificationService.showNotification(response.returnMsg);
          }
        });
      }
      );
    } else {
      this.notificationService.showNotification(NOTIFICATION_MSG.dashboardMenuNotificationMSG);
    }

  }
  getBillingId(): void {
    this.billingIdService.getBillingId().pipe(
      filter(billingId => !!billingId?.length),
      tap(() => {
        this.locationDdl = of(undefined);
        this.workOrderGraph = of(undefined);
        this.woRows = of(null);
        this.pmRows = of(null);
        this.invoiceRows = of(null);
        this.serialUnitNoDdl = of(undefined);
      }),
      switchMap(billingId => {
        this.billingId = billingId;
        return this.getDashboardData(billingId);
      }),
      takeUntil(this.unSubscribe$)
    ).subscribe();
  }

  private getDashboardData(billingId: string[]): Observable<any> {
    const locationReq = this._getLocationMetaData(billingId);
    const woRequest = this.getWoList(billingId);
    const pMWoRequest = this.getPMWoList(billingId);
    const invoiceRequest = this.getInvoiceList(billingId);
    const equipmentMetadataRequest = this.getEquimentListMetadata(billingId);
    const workOrderStatusGraphRequest = this.getWorkOrderStatusGraph(billingId, []);
    const kpiReport = this._fetchKpiReport(billingId);
    let combineRequest: any = [];
    combineRequest.push(locationReq);
    if (!this.isAdmin) {
      const menuId = [{ key: 1, value: [kpiReport] }, { key: 2, value: [woRequest] }, { key: 3, value: [pMWoRequest] },
      { key: 4, value: [invoiceRequest] },
      { key: 6, value: [equipmentMetadataRequest, workOrderStatusGraphRequest] }];
      menuId.forEach(({ key, value }) => {
        const previlage = this.userPrivilage[key];
        if (previlage?.menuStatus === 'A' &&
          previlage?.userMenuStatus === 'A' &&
          previlage?.adminMenuStatus === 'A') {
          combineRequest.push(...value);
        }
      });
    } else {
      combineRequest = [locationReq, woRequest, pMWoRequest, invoiceRequest,
        equipmentMetadataRequest, workOrderStatusGraphRequest, kpiReport];
    }
    this.resetServiceReport()
    return merge(...combineRequest);
  }
  private _initLocationDropdownValues(locations: LocationList[]): void {
    const locationIds = locations?.map(({ shipTo }) => shipTo) || [];
    this.woStatusGraphlocations = locationIds;
    this.kpiLocation = locationIds;
    this.executiveSummaryLocation = locationIds;
    this.serviceReportLocations = locationIds;
    this.serviceReportForm.get('location')?.setValue(locationIds);
  }
  private _getLocationMetaData(billingId: string[]): Observable<Dropdown> {
    this.locationDdl = this.equipmentService.getLocationMetadata({ billingId }).pipe(
      tap((locations) => this._initLocationDropdownValues(locations)),
      map((locations) => ({
        multi: true, placeholder: 'Locations',
        data: locations.map(({ location, shipTo }) => ({ key: shipTo, value: location }))
      })),
      share(),
      catchError(() => of({ multi: true, placeholder: 'Locations', data: [] }))
    );
    return this.locationDdl;
  }
  /**
   * Method to invoke recent WO list
   * @param billingId
   */
  public getWoList(billingId: string[]): Observable<WorkOrder[]> {
    const woRequest: WorkOrderListRequest = {
      billingId,
      equipSRNO: null,
      fromDate: null,
      limitList: 10,
      offsetList: 0,
      orderBy: SORT_KEY.workListSorting,
      toDate: null,
      woID: null,
      woStatus: [],
      location: [],
      isPM: 2
    };
    return this.woService.getWorkOrderList(woRequest).pipe(
      map(({ returnCode, wolist }) => returnCode === 0 ? wolist : []),
      tap((wolist) => this.woRows = of(wolist)),
      catchError(() => {
        this.woRows = of([]);
        return of([]);
      })
    );
  }
  /**
   * Method to invoke recent PM WO list
   * @param billingId
   */
  public getPMWoList(billingId: string[]): Observable<PMWorkOrder[]> {
    const pmWoRequest: PMWorkOrderListRequest = {
      billingId,
      equipMfr: null,
      equipProdId: null,
      equipSRNO: null,
      equipUnitNo: null,
      limitList: 10,
      location: [],
      offsetList: 0,
      orderBy: SORT_KEY.pmListSorting
    };
    return this.pmWoService.getPMWorkOrderList(pmWoRequest).pipe(
      map(({ returnCode, pmwolist }) => returnCode === 0 ? pmwolist : []),
      tap((pmwolist) => this.pmRows = of(pmwolist)),
      catchError(() => {
        this.pmRows = of([]);
        return of([]);
      })
    );
  }
  /**
   * Method to invoke recent Invoice list
   * @param billingId
   */
  public getInvoiceList(billingId: string[]): Observable<Invoice[]> {
    const invoiceRequest: InvoiceListRequest = {
      billingId,
      department: [],
      fromDate: null,
      invoiceNo: null,
      invoiceStatus: null,
      limitList: 10,
      location: [],
      offsetList: 0,
      orderBy: SORT_KEY.invoiceListSorting,
      toDate: null
    };
    return this.invoiceService.getInvoiceList(invoiceRequest).pipe(
      map(({ returnCode, invoiceList }) => returnCode === 0 ? invoiceList : []),
      tap((invoiceList) => this.invoiceRows = of(invoiceList)),
      catchError(() => {
        this.invoiceRows = of([]);
        return of([]);
      })
    );
  }
  /**
   * Method to invoke Equipment List metadata API
   */
  public getEquimentListMetadata(billingId: string[]): Observable<Dropdown> {
    const equipmentRequest: EquipmentListMetadataRequest = {
      billingId
    };
    return this.equipmentService.getEquipmentListMetadata(equipmentRequest).pipe(
      tap((EquipList) => this.serialUnitNoDdl = of(EquipList)));
  }
  /**
   * Method to invoke Equipment List metadata API
   */
  public getWorkOrderStatusGraph(billingId: string[], location: string[])
    : Observable<{ wostatuslist: WoStatus[], wostatusMap: WostatusMap[] }> {
    const workOrderStatusGraphRequest: WorkOrderStatusGraphRequest = {
      location,
      billingId,
      isPM: this.selectedWoStatusGraphId
    };
    return this.woService.getWorkOrderStatusGraph(workOrderStatusGraphRequest).pipe(
      map(({ returnCode, wostatuslist, wostatusMap }) => returnCode === 0 ?
        { wostatuslist, wostatusMap } :
        { wostatuslist: [], wostatusMap: [] }),
      tap(({ wostatusMap, wostatuslist }) => this.workOrderGraph = of(this.populateWorkOrderStatusGraph(wostatuslist, wostatusMap))),
      catchError(() => {
        this.workOrderGraph = of(new WorkOrderStatusGraph());
        return of({ wostatuslist: [], wostatusMap: [] });
      })
    );
  }
  private _generateKPIRequest(billingId: string[]): KpiRequest {
    return {
      billingId, equipmentNo: [],
      fromDate: this.kpiFilterData?.fromDate || null,
      toDate: this.kpiFilterData?.toDate || null,
      isPMWO: this.kpiFilterData?.isPMWO || null,
      kpid: this.kpiId || DEFAULT_KPI_REPORT_ID,
      location: this.kpiLocation || []
    };
  }
  private _fetchKpiReport(billingId: string[]): Observable<KpiReport> {
    const data = this._generateKPIRequest(billingId);
    this.kpiReport$ = of(undefined);
    return this.kpiService.fetchKPIReport(data).pipe(
      map((kpiReport) => kpiReport.returnCode === 0 ? kpiReport : new KpiReport()),
      tap((kpiReport) => {
        this.kpiReport$ = of(kpiReport);
        // this.kpiFilterData = undefined;
      }),
      catchError(() => {
        this.kpiReport$ = of(new KpiReport());
        return of(new KpiReport());
      })
    );
  }
  /**
   * Method to invoke on WO status graph dropdown changes
   *
   */
  public onWorkOrderStatusChange(): void {
    this.workOrderGraph = this.getWorkOrderStatusGraph(this.billingId, this.woStatusGraphlocations).pipe(
      map(({ wostatusMap, wostatuslist }) => this.populateWorkOrderStatusGraph(wostatuslist, wostatusMap))
    );
  }
  /**
   * Method to populate the Model to render the WO status Graph
   * @param data
   */
  public populateWorkOrderStatusGraph(data: WoStatus[], wostatusMap: WostatusMap[]): WorkOrderStatusGraph {
    const workOrderGraph = new WorkOrderStatusGraph();
    const woSelectedData = { woId: '', woType: this.selectedWoStatusGraphId, location: this.woStatusGraphlocations };
    this.woService.setWoSelectedMetadata(woSelectedData);
    if (data.length) {
      workOrderGraph.wostatusMap = wostatusMap;
      const objectKeys = Object.entries(data[0]);
      // workOrderGraph = new WorkOrderStatusGraph();
      workOrderGraph.total = data[0].totalCount;
      this.woStatusDd.data.forEach(element => {
        if (element.key === this.selectedWoStatusGraphId) {
          workOrderGraph.type = element.key === 2 ? 'Total Work Orders' : `Total ${element.value}`;
        }
      });
      objectKeys.forEach(([key, value]) => {
        if (value && value !== '0' && key !== 'totalCount') {
          const [id, color] = (this.woStatusGraphStyle as any)[key];
          workOrderGraph.columns.push([id, value]);
          workOrderGraph.colors[id] = color;
        }
      });
    }
    return workOrderGraph;
  }
  onKpiIdChange(): void {
    if (this.kpiId) {
      this.kpiReportName = this.kpiDdl.data.find(({ key }) => key === this.kpiId)?.value;
      this._callReportFetchAPi();
    }
  }
  private _callReportFetchAPi(): void {
    this._fetchKpiReport(this.billingId).pipe(
      takeUntil(this.unSubscribe$)
    ).subscribe();
  }
  private _fetchKpiReportList(): void {
    this.kpiService.fetchKPIReportMetadata().subscribe(data => {
      this.kpiDdl = { ...this.kpiDdl, data: [...data] };
      this.kpiReportName = data.find(({ key }) => key === DEFAULT_KPI_REPORT_ID)?.value;
      this.kpiId = DEFAULT_KPI_REPORT_ID;
    });
  }
  showKpiFilter(): void {
    if (this.kpiId) {
      const fromDate = this.kpiFilterData.fromDate ? new Date(this.kpiFilterData.fromDate) : '';
      const toDate = this.kpiFilterData.toDate ? new Date(this.kpiFilterData.toDate) : '';
      const isPMWO = this.kpiFilterData.isPMWO ? +this.kpiFilterData.isPMWO : null;
      const filterData: KpiFilter = { fromDate, toDate, isPMWO };
      const dialogRef = this.dialog.open(KpiFilterComponent,
        { width: '300px', data: filterData });
      dialogRef.afterClosed().pipe(
        filter(data => data)
      ).pipe(
        switchMap((data: KpiFilter) => {
          this.kpiFilterData = data;
          return this._fetchKpiReport(this.billingId);
        }),
        takeUntil(this.unSubscribe$)
      ).subscribe();
    } else {
      this.notificationService.showNotification(NOTIFICATION_MSG.kpiReportRequired);
    }
  }
  downloadKPIReport(): void {
    const data = this._generateKPIRequest(this.billingId);
    this.kpiService.downloadKPIReport(data);
  }
  public _showExecutiveSummaryPopup(): Observable<any> {
    const dialogRef = this.dialog.open(ExecutiveSummaryGraphComponent, {
      width: '1000px',
      height: '500px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: { isNotDashboard: true, location: this.executiveSummaryLocation }
    });
    return dialogRef.afterClosed();
  }
  onExecutiveSummaryLocationChange(): void {
    this.selectedLocations.next({ location: this.executiveSummaryLocation });
  }
  private _generatedownloadSeriveReportReq(fromValue: ServiceReportForm): ServiceReportReq {
    const toDate = fromValue.toDate?.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) || '';
    const fromDate = fromValue.fromDate?.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) || '';
    const userName = `${this.userData?.userFName || ''} ${this.userData?.userLName || ''}`;
    const billingId = this.billingId;
    const woPdfPath= `${this.woPdfBaseUrl}/` || '';
    return { ...fromValue, toDate, fromDate, billingId, userName, woPdfPath};
  }
  private _validateSeriveReportDownload(): boolean {
    if (this.serviceReportForm.get('fromDate')?.errors ||
      this.serviceReportForm.get('toDate')?.errors) {
        this.notificationService.showNotification(NOTIFICATION_MSG.inValidDateFormat);
        return false;
    }
    if (!this.serviceReportForm.valid) {
      this.notificationService.showNotification(NOTIFICATION_MSG.noReportId);
      return false;
    }
    if (!this.billingId.length) {
      this.notificationService.showNotification(NOTIFICATION_MSG.billigIdRequired);
      return false;
    }
    return true;
  }
  resetServiceReport(): void {
    this.serviceReportForm.setValue({
      fromDate: null,
      toDate: null,
      serialNoUnitNo: '',
      serviceDetailId: '',
      location: this.serviceReportLocations
    });
  }
  downloadSeriveReport(): void {
    if (this._validateSeriveReportDownload()) {
      const payload = this._generatedownloadSeriveReportReq(this.serviceReportForm.value);
      this.serviceDetailsService.downloadServiceReport(payload);
    }
  }
  public openWOPdf(path: string): void {
    if (path) {
      window.open(this.woPdfBaseUrl + (path.startsWith('/') ? path : `/${path}`), '_blank');
    } else {
      this.notificationService.showNotification(NOTIFICATION_MSG.woPdfValidationMSG);
    }
  }
  private _genereateInvoicePdfDownloadPayload(invoiceNumber: string[]): InvoicePdfDownload {
    return { departId: '', invoiceNumber, invoiceTotalAmt: null };
  }
  downloadInvoicePdf(invoiceLists: Invoice): void {
    const invoiceNumber = [invoiceLists.invoiceNumber];
    const data = this._genereateInvoicePdfDownloadPayload(invoiceNumber);
    this.invoiceService.downloadinvoicePdf(data);
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next(true);
    this.unSubscribe$.complete();
  }
}
