
import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Dropdown } from './../shared/components/multiselect/dropdown.interface';
import { SubHeaderComponent } from '../home/sub-header/sub-header.component';
import { UserPreAccess } from '../login/login.interface';
import { AUTHKEY } from '../shared/constants/auth.constant';
import { BillingIdService } from '../shared/services/billing-id.service';
import { UserService } from '../shared/services/user.service';
import { NotificationService } from '../shared/services/notification.service';
import { BillId } from '../shared/interfaces/billid.interface';
import { SearchInput } from '../shared/components/search/search.interface';
import { ColumnDefs, ExpColumDef, TableSettings } from '../shared/components/table/table.interface';
import { TOPASSET_LIST_COLUMNS, MHE_COST_COLUMNS,FLEET_ASSET_SUMMARY_COLUMNS, TOPASSET_LIST_EXP_COLUMNS, AVOIDABLE_SPEND_COLUMNS, FLEET_COMPOSITION_COLUMNS, FLEET_ASSET_SUMMARY_EXP_COLUMNS, } from '../shared/constants/table.constant';
import * as c3 from 'c3';
import * as d3 from 'd3';
import { ReportService } from './report.service';
import { LoaderService } from '../shared/services/loader.service';
import { UtlilityService } from '../shared/services/utlility.service';
import { topAssetList,  fleetAssetSummary, MHECost, MHECostTable, fleetCompoTable, avoidableSpendTable, fleetInterface, avoidable } from '../shared/interfaces/report';
import { SORT_KEY } from '../shared/constants/sortkey.constant';
import { Observable, of, Subject } from 'rxjs';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShippingIdSelectionComponent } from '../admin/customers/shipping-id-selection/shipping-id-selection.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

    @ViewChild('monthlyServiceCurrent') monthlyServiceCurrentGraph: ElementRef<HTMLElement> | undefined;
    @ViewChild('monthlyServicePrevious') monthlyServicePreviousGraph: ElementRef<HTMLElement> | undefined;
    @ViewChild('monthlyRentalCurrent') monthlyRentalCurrentGraph: ElementRef<HTMLElement> | undefined;
    @ViewChild('monthlyRentalPrevious') monthlyRentalPreviousGraph: ElementRef<HTMLElement> | undefined;
    @ViewChild('top10TotalsGraph') top10TotalsPieChart: ElementRef<HTMLElement> | undefined;
    @ViewChild('spendByClaimTypeGraph') spendByClaimTypeBarGraph: ElementRef<HTMLElement> | undefined;
     @Input() show = '';
     @ViewChildren('datePicker') datePicker: any;
     maxDate = new Date();
    currentMHECost:any = {};
    costPerHr:any=[];
    mheCos:Observable<MHECostTable[] | null> = of([]);
    fleetCompo:any={};
    fleetCompoar:Observable<fleetCompoTable[] | null> = of([]);
    serviceAsset:any={};
    graphColor: any | undefined;
    pieChartData:any = [];
    pieTotal = 0;
    currentPercentTotal:any;
    previousPercentTotal:any;
    monthlyServiceCurrentData:any=[];
    monthlyServicePreviousData:any=[];
    monthlyRentalPreviousData:any=[];
    monthlyRentalCurrentData:any=[];
    spendByClaimData:any=[];
    avoidableSpend:any={};
    avoidablear:Observable<avoidableSpendTable[] | null> = of([]);
    topAssetTotal:any={};
    fleetAssetSummaryData:any={};
    topAssetData:any={};
    totalAssetSum=0;
    costPerUnit=0;
    serialNumbers=0;
    donutChart: any;
    donutChartColors: any = {};
    sum=0;
    truckServiceSum=0;
    totalCharges=0;
    totalSpend:any;
    totalRentalSpend:any;
    percentTotSpend:any;
    private orderBy: string = SORT_KEY.topAssetTotalsSorting;
    mhePrevYear:boolean=true;
    mheCurYear:boolean=true;
    fleetPrevYear:boolean=true;
    fleetCurYear:boolean=true;
    avoidablePrevYear:boolean=true;
    avoidableCurYear:boolean=true;
    columns: Array<ColumnDefs> = MHE_COST_COLUMNS as Array<ColumnDefs>;
    billingId: Array<string> = [];
    shippingId: Array<string> = [];
    selectedAdminBillingId = '';
    isAdmin = false;
    billingIdDdl: Dropdown = {
      multi: true,
      placeholder: 'Billing ID',
      data: []
    };
    shippingIdDdl: Dropdown = {
      multi: true,
      placeholder: 'Shipping ID',
      data: []
    };
    shipId='';
    curYearStartDate:Date |string ='';
    curYearEndDate:Date | string ='';
    prevYearStartDate:Date | string ='';
    prevYearEndDate:Date | string ='';
  loader = false;
  searchData: fleetAssetSummary | undefined;

  topAssetColumns: Array<ColumnDefs> = TOPASSET_LIST_COLUMNS as Array<ColumnDefs>;
  topAssetExpColumns: Array<ExpColumDef> = TOPASSET_LIST_EXP_COLUMNS as Array<ExpColumDef>;
  topAssetRows: Observable<topAssetList[] | null> = of([]);
  topAssetSettings: TableSettings = { expandable: true, selectable: false, localSort: true };
  @Input() rowData: Array<any> = [];

  mheCostColumns: Array<ColumnDefs> = MHE_COST_COLUMNS as Array<ColumnDefs>;
  mheCostRows: Observable<MHECost[] | null> = of([]);
  mheCostSettings: TableSettings = { expandable: false, selectable: false,  pagination: false,localSort: true };

  fleetColumns: Array<ColumnDefs> = FLEET_COMPOSITION_COLUMNS as Array<ColumnDefs>;
  fleetRows: Observable<fleetInterface[] | null> = of([]);
  fleetSettings: TableSettings = { expandable: false, selectable: false,  pagination: false,localSort: true };


  avoidableColumns: Array<ColumnDefs> = AVOIDABLE_SPEND_COLUMNS as Array<ColumnDefs>;
  avoidableRows: Observable<avoidable[] | null> = of([]);
  avoidableSettings: TableSettings = { expandable: false, selectable: false,  pagination: false,localSort: true };

  fleetAssetSummaryColumns: Array<ColumnDefs> = FLEET_ASSET_SUMMARY_COLUMNS as Array<ColumnDefs>;
  fleetAssetSummaryExpColumns: Array<ExpColumDef> = FLEET_ASSET_SUMMARY_EXP_COLUMNS as Array<ExpColumDef>;
  fleetAssetSummaryRows: Observable<fleetAssetSummary[] | null> = of([]);
  fleetAssetSummarySettings: TableSettings = { expandable: true, selectable: false,  pagination: false,localSort: true };

    firstName: string = this.user.getUserDetails()?.userFName || '';
    lastName: string = this.user.getUserDetails()?.userLName || '';
    userPrivilage: UserPreAccess[] = this.user.getUserDetails()?.userPreAccess || [];
    userType: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  selectedShipToRows: any[]=[];
  selectedAdminShipingId: any ='';
  selectedAdminShipToRows: any[]=[];
  arrayData: any[] = [];
    constructor(
      private billingIdService: BillingIdService,
      private user: UserService,
      private reportData:ReportService,
      private notification: NotificationService,
      private utlilityService: UtlilityService,
      private loaderService: LoaderService,

    ) {  }

    ngOnInit(): void {
      this.emitShippingId();
      // const userDetails = this.user.getUserDetails();
      // this.emailId=userDetails?.email || '';
      const userBillIds = this.user.getUserDetails()?.userBillIds || [];
      this.getShippingDl(userBillIds);
      this.isAdmin = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN;
      this.billingIdDdl.data = userBillIds?.map(({ billTo, billToAddress, billToName }) =>
        ({ key: billTo, value: `${billTo} | ${billToName} | ${billToAddress}` }));
      const { id, name } = this.billingIdService.restoreSelectedBillingId();
      this.selectedAdminBillingId = this.isAdmin ? name : '';
      if (id) {
        this.billingId = id;
        this.billingIdService.emitBillingId(id, name);
      } else {
        const initialSelectedIds = userBillIds?.map(({ billTo }) => billTo);
        this.billingIdService.emitBillingId(initialSelectedIds);
        this.billingId = initialSelectedIds;
      }
      if(!this.isAdmin){
        this.billingIdService.getBillingId().subscribe(res=>{
          this.billingId = res;
          this.getShippingDl(userBillIds);

        });
      }
    }
    _initData(): void {
      this.getCurrentMHECost();
      this.getAvoidableSpend();
      this.fleetComposition();
      this.monthlyRentalComparison();
      this.monthlyServiceComparison();
      this.spendByClaimType();
      this.top10AssetTotals();
      this.getFleetAssetSummary();
      this.getTopAssetList();
    }

    onSearch(){
    this._initData();
    }
    emitShippingId(){
      const data = localStorage.getItem("SelectedShippingIds");
      if (data) {
        return JSON.parse(data);
      }
     return { id: null, name: ''};
    }

    clearForm(){
    this.curYearStartDate='';
    this.curYearEndDate ='';
    this.prevYearStartDate ='';
    this.prevYearEndDate ='';
    }


    getShippingDl(userBillIds: any[]){
      this.selectedShipToRows = [];
      let filteredX = userBillIds.filter(itemX => this.billingId.includes(itemX.billTo));
        let arr = filteredX.map(data=>{return data.details});
        arr.forEach((element:any) => {
          element.forEach((data:any)=>{
            if (data!=null) {
              this.selectedShipToRows.push({
                company: data.company,
                location: data.location,
                shipTo: data.shipTo
              });
            }
          })
        });
        this.shippingIdDdl ={
          multi: false,
          placeholder: 'Shipping ID',
          data:  this.selectedShipToRows?.map(({ shipTo, company, location }) =>
          ({ key: shipTo, value: `${shipTo} | ${company} | ${location}` }))
        };

    }
    changeBillingId(): void {
      this.billingIdService.emitBillingId(this.billingId);
    }
    public changeShippingingId(event:any){
      console.log(event,"__");
    }

    onAdminBillingIdChange(bill: BillId): void {
        const { billTo, billToName, billToAddress } = bill;
      this.selectedAdminBillingId = `${billTo} | ${billToName} | ${billToAddress}`;
      const billingId = [billTo];
      this.onAdminShippingIdChange(bill)
      this.billingIdService.emitBillingId(billingId, this.selectedAdminBillingId);
    }
    onAdminShippingIdChange(bill: any): void {
      this.selectedAdminShipToRows=[];
      this.shippingIdDdl.data =[];
      if(!!bill.details){
        let shipDetails = bill.details.forEach((element: any) => {
          if (element!=null) {
            this.selectedAdminShipToRows.push({
              company: element.company,
              location: element.location,
              shipTo: element.shipTo
            });
          }
        });
      }
      const { shipTo, company, location } =bill.details;
      // this.selectedAdminShipingId = `${shipTo} | ${company} | ${location}`;
      this.shippingIdDdl ={
        multi: false,
        placeholder: 'Shipping ID',
        data:  this.selectedAdminShipToRows?.map(({ shipTo, company, location }) =>
        ({ key: shipTo, value: `${shipTo} | ${company} | ${location}` }))
      };
      const billingId = [shipTo];
    }
    onBillingIdChange(event: any, bill: any): void {
      if (event.source._selected) {
        this.selectedAdminShipingId = event.source.value;
      }
    console.log(bill, "Admin bill");
    this.shippingId=bill;
    const stringifiedData = JSON.stringify(this.selectedAdminShipingId);
    localStorage.setItem('SELECTED_SHIPPING_ID', stringifiedData);
    }
    public getCurrentMHECost() {
      this.loaderService.show();

      const currentMHECostRequest = {
              billingId: this.billingId,
              curYearFromDate: new Date(this.curYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              curYearToDate: new Date(this.curYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearFromDate: new Date(this.prevYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearToDate: new Date(this.prevYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
      this.reportData.getCurrentMHECost(currentMHECostRequest).subscribe((response:any) => {
        this.currentMHECost = response;
        if(this.currentMHECost.currentMHECostCurYear.length && this.currentMHECost.currentMHECostPreYear){
        this.totalSpend=Number(this.currentMHECost.currentMHECostCurYear[0].totalService? this.currentMHECost.currentMHECostCurYear[0].totalService : 0)+Number(this.currentMHECost.currentMHECostPreYear[0].totalService ? this.currentMHECost.currentMHECostPreYear[0].totalService : 0)+Number(this.currentMHECost.currentMHECostCurYear[0].totalRent ? this.currentMHECost.currentMHECostCurYear[0].totalRent : 0)+Number(this.currentMHECost.currentMHECostPreYear[0].totalRent ? this.currentMHECost.currentMHECostPreYear[0].totalRent : 0);
        this.totalRentalSpend=Number(this.currentMHECost.currentMHECostCurYear[0].totalRent ? this.currentMHECost.currentMHECostCurYear[0].totalRent : 0);
        const mheCost:any = []
        mheCost.push(
          {period:'Current',
          totalTruckSpend:Number( this.currentMHECost.currentMHECostCurYear[0].totalService )+ Number(this.currentMHECost.currentMHECostCurYear[0].totalParts),
          totalRentalSpend:this.currentMHECost.currentMHECostCurYear[0].totalRent }
          )
        mheCost.push(
          {period:'Previous',
          totalTruckSpend:Number( this.currentMHECost.currentMHECostPreYear[0].totalService )+ Number(this.currentMHECost.currentMHECostPreYear[0].totalParts),
          totalRentalSpend:this.currentMHECost.currentMHECostPreYear[0].totalRent }
          )

        this.mheCos = of(mheCost);
        }
        this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }
    public fleetComposition() {
      this.loaderService.show();
      const fleetCompositionRequest = {
              billingId: this.billingId,
              curYearFromDate: new Date(this.curYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              curYearToDate: new Date(this.curYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearFromDate: new Date(this.prevYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearToDate: new Date(this.prevYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
      this.reportData.fleetComposition(fleetCompositionRequest).subscribe((response:any) => {
        this.fleetCompo=response;

        const fleetCompos = []
        if(response.fleetCompCurYear.length && response.fleetCompCurYear.length){
        fleetCompos.push(
          {period:'Current',
          activeUnitsServiced: response.fleetCompCurYear[0].equipCount,
          averageCostPerUnit:response.fleetCompCurYear[0].avgCostPerUnit }
        )
        fleetCompos.push(
          {period:'Previous',
          activeUnitsServiced: response.fleetCompPreYear[0].equipCount,
          averageCostPerUnit:response.fleetCompPreYear[0].avgCostPerUnit }

        )
        }
        this.fleetCompoar = of(fleetCompos);

        this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }

    public monthlyRentalComparison() {
      this.loaderService.show();
      const monthlyRentalComparisonRequest = {
              billingId: this.billingId,
              curYearFromDate: new Date(this.curYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              curYearToDate: new Date(this.curYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearFromDate: new Date(this.prevYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearToDate: new Date(this.prevYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
      this.reportData.monthlyRentalComparison(monthlyRentalComparisonRequest).subscribe((response:any) => {
          this.monthlyRentalCurrentData=[
            ['Current'],
          ];
          for (let j = 0; j < response.monthlyRentalComparisonCurYearlist.length ; j++){
          this.monthlyRentalCurrentData[0].push(Number(response.monthlyRentalComparisonCurYearlist[j].totalRent).toFixed(2));
          }
           this.generateRentalCurrentGraph();
           this.monthlyRentalPreviousData=[
            ['Previous']
          ];
          for (let j = 0; j < response.monthlyRentalComparisonPreYearlist.length ; j++){
            this.monthlyRentalPreviousData[0].push(Number(response.monthlyRentalComparisonPreYearlist[j].totalRent).toFixed(2));
            }
        this.generateRentalPreviousGraph();
        this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }

    public monthlyServiceComparison() {
      this.loaderService.show();
      const monthlyServiceComparisonRequest = {
              billingId: this.billingId,
              curYearFromDate: new Date(this.curYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              curYearToDate: new Date(this.curYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearFromDate: new Date(this.prevYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearToDate: new Date(this.prevYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
      this.reportData.monthlyServiceComparison(monthlyServiceComparisonRequest).subscribe((response:any) => {
        this.graphColor = {};
        this.monthlyServiceCurrentData = [
          ['Current'],

        ];
        for (let i = 0; i < response.monthlyServiceComparisonCurYearlist.length ; i++){
          this.monthlyServiceCurrentData[0].push(Number(response.monthlyServiceComparisonCurYearlist[i].totalService).toFixed(2));
          this.graphColor = { 'Current': '#912728' };
        }
        this.generateGraphCurrent();
        this.monthlyServicePreviousData = [
          ['Previous']
        ];
        for (let i = 0; i < response.monthlyServiceComparisonPreYearlist.length ; i++){
           this.monthlyServicePreviousData[0].push(Number(response.monthlyServiceComparisonPreYearlist[i].totalService).toFixed(2));
          this.graphColor = {
            ...this.graphColor, 'Previous': '#2e97fd'
          };
        }

        this.generateGraphPrevious();
        this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }

    public spendByClaimType() {
      this.loaderService.show();
      const spendByClaimTypeRequest = {
              billingId: this.billingId,
              curYearFromDate: new Date(this.curYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              curYearToDate: new Date(this.curYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearFromDate: new Date(this.prevYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearToDate: new Date(this.prevYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
      this.reportData.spendByClaimType(spendByClaimTypeRequest).subscribe((response:any) => {
        this.generateBarGraph();
        this.spendByClaimData = [
          ['Current'],
          ['Previous']
        ];
        if(response.spendByClaimCurYear.length && response.spendByClaimPrevYear.length){
        for (let i = 0; i < response.spendByClaimCurYear.length ; i++){
          this.spendByClaimData[0].push(Number( response.spendByClaimCurYear[i].total));
          this.graphColor = { 'Current': '#912728' };
          this.spendByClaimData[1].push(Number(response.spendByClaimPrevYear[i].total));
          this.graphColor = {
            ...this.graphColor, 'Previous': '#2e97fd'
          };
        }
      }
          this.generateBarGraph();

          this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }

    public top10AssetTotals() {
      this.loaderService.show();
      //debugger

      const topAssetTotalsRequest = {
        billingId: this.billingId,
        fromDate: new Date(this.curYearStartDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        toDate: new Date(this.curYearEndDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        //orderBy: this.orderBy
      }
      this.pieChartData = [];
      this.reportData.top10AssetTotals(topAssetTotalsRequest).subscribe((response:any) => {
       this.topAssetTotal=response
       console.log(this.topAssetTotal);

       for (let j= 0; j< 10; j++) {
        this.truckServiceSum=this.truckServiceSum+Number(this.topAssetTotal.serviceAssets[j].amountTotal? this.topAssetTotal.serviceAssets[j].amountTotal : 0)
         this.sum=this.sum+Number(this.topAssetTotal.serviceAssets[j].amountTotal? this.topAssetTotal.serviceAssets[j].amountTotal : 0)
       }

       const colors = ['#5668e2', '#56aee2', '#e28956', '#8a56e2', '#e25668', '#cf56e2', '#e2cf56', '#56e2cf', '#e256ae', '#68e256'];
      for (let i = 0; i <=10 ; i++) {
        this.pieChartData.push([response.serviceAssets[i].assetNo , response.serviceAssets[i].amountTotal]);
        this.donutChartColors[response.serviceAssets[i].assetNo] = colors[i];
        this.pieTotal = Number(this.pieTotal) + Number(response.serviceAssets[i].amountTotal);
        this.generatePieChart();

      }

        this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }




    public getAvoidableSpend() {
      this.loaderService.show();
      const avoidableSpendRequest = {
              billingId: this.billingId,
              curYearFromDate: new Date(this.curYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              curYearToDate: new Date(this.curYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearFromDate: new Date(this.prevYearStartDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              prevYearToDate: new Date(this.prevYearEndDate).
                toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }

      this.reportData.getAvoidableSpend(avoidableSpendRequest).subscribe((response:any) => {
        this.avoidableSpend=response;
        if(this.avoidableSpend.avoidableSpendCurYear){
        this.currentPercentTotal=(this.avoidableSpend.avoidableSpendCurYear[0].total /this.avoidableSpend.avoidableSpendCurYear[0].totalService);
        this.previousPercentTotal=(this.avoidableSpend.avoidableSpendPreYear[0].total/this.avoidableSpend.avoidableSpendPreYear[0].totalService);
       const avoidar = []
        avoidar.push(
          {period:'Current',
          totalOperatorError: this.avoidableSpend.avoidableSpendCurYear[0].total,
          percentTotalSpend:this.currentPercentTotal}

        )
        avoidar.push(
          {period:'Previous',
          totalOperatorError: this.avoidableSpend.avoidableSpendPreYear[0].total,
          percentTotalSpend:this.previousPercentTotal}

        )
        this.avoidablear = of(avoidar);
        }
         this.loaderService.hide();
      }, error =>{
        console.log(error);
        this.loaderService.hide();
      })
    }



    public getTopAssetList() {
      this.loaderService.show();
      const topAssetListRequest = {
        billingId: this.billingId,
        curYearFromDate: new Date(this.curYearStartDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        curYearToDate: new Date(this.curYearEndDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),

      }
      this.reportData.getTopAssetList(topAssetListRequest).subscribe((response:any) => {
      console.log(response);
      this.topAssetRows = of(response.topAssetList);
      this.loaderService.hide();
    }, error =>{
      console.log(error);
      this.loaderService.hide();
    })
  }

  public getFleetAssetSummary() {
    this.loaderService.show();

    const fleetAssetSummaryRequest = {
      billingId: this.billingId,
      curYearFromDate: new Date(this.curYearStartDate).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      curYearToDate: new Date(this.curYearEndDate).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),

    }
    this.reportData.getFleetAssetSummary(fleetAssetSummaryRequest).subscribe((response:any) => {
      console.log(response);

      this.fleetAssetSummaryData=response.fleetAssetSummary
      for (let j= 0; j<this.fleetAssetSummaryData.length ; j++){
          /*if(Number.isFinite(Number(this.fleetAssetSummaryData[j].amountTotal ?this.fleetAssetSummaryData[j].amountTotal: 0) / (Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs: 0)))) {
            this.fleetAssetSummaryData[j].costPerHr = Number(this.fleetAssetSummaryData[j].amountTotal ?this.fleetAssetSummaryData[j].amountTotal: 0) / (Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs: 0));
          }*/
          this.fleetAssetSummaryData[j].amountParts = '$'+Number(this.fleetAssetSummaryData[j].amountParts);
          this.fleetAssetSummaryData[j].amountLabor = '$'+Number(this.fleetAssetSummaryData[j].amountLabor);
          this.fleetAssetSummaryData[j].amountOther = '$'+Number(this.fleetAssetSummaryData[j].amountOther);
          this.fleetAssetSummaryData[j].amountTax = '$'+Number(this.fleetAssetSummaryData[j].amountTax);
          if(Number.isFinite(Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs: 0) / (Number(this.fleetAssetSummaryData[j].varDays ?this.fleetAssetSummaryData[j].varDays: 0)))) {
            this.fleetAssetSummaryData[j].annHr = Number(Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs:0)  / Number(this.fleetAssetSummaryData[j].varDays ?this.fleetAssetSummaryData[j].varDays: 0))*365;
          }
      }
      this.fleetAssetSummaryRows = of(this.fleetAssetSummaryData);
      for (let j= 0; j<this.fleetAssetSummaryData.length ; j++) {
        this.totalCharges=this.totalCharges+Number(this.fleetAssetSummaryData[j].amountTotal? this.fleetAssetSummaryData[j].amountTotal : 0)
        this.serialNumbers=this.fleetAssetSummaryData.length;
        this.costPerUnit=this.costPerUnit+Number(this.fleetAssetSummaryData[j].costPerHr? this.fleetAssetSummaryData[j].costPerHr : 0);
      }
    this.loaderService.hide();
  }, error =>{
    console.log(error);
    this.loaderService.hide();
  })
}
downloadExcel(): void {
  const data = this.generateFleetAssetReportModel(this.billingId);
 this.reportData.downloadFleetAssetSummaryList(data);
}


private generateFleetAssetReportModel(
  billingId: string[],
  /*curYearStartDate:Date,
  curYearEndDate:Date
  limitList: number,
  offsetList: number*/): any {
  return {
    billingId,
    assetNo: this.searchData?.assetNo || null,
    serialNo: this.searchData?.serialNo || null,
    equipMake: this.searchData?.equipMake || null,
    equipModel: this.searchData?.equipModel || null,
    equipYear: this.searchData?.equipYear || null,
    firstOrderDate:this.searchData?.firstOrderDate || null,
    lastOrderDate:this.searchData?.lastOrderDate || null,
    firstMeter:this.searchData?.firstMeter || null,
    lastMeter:this.searchData?.lastMeter || null,
    amountParts:this.searchData?.amountParts || null,
    amountLabor:this.searchData?.amountLabor || null,
    amountOther:this.searchData?.amountOther || null,
    amountTax:this.searchData?.amountTax || null,
    amountTotal:this.searchData?.amountTotal || null,
    varDays:this.searchData?.varDays || null,
    varHrs:this.searchData?.varHrs || null,
    annHr:this.searchData?.annHr || null,
    equipAge:this.searchData?.equipAge || null,
  };
}

    /** Generate Graph */
    generateGraphCurrent(){
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let curMonths = [];
      let combinedMonths: string[] = [];
      let curStartDate = new Date(this.curYearStartDate);
      let curEndDate = new Date(this.curYearEndDate);
      curStartDate.setMonth(curStartDate.getMonth());
      curEndDate.setMonth(curEndDate.getMonth());
      if(curStartDate.getMonth() > curEndDate.getMonth()) {
      curMonths = months.slice(curStartDate.getMonth(), curEndDate.getMonth()+13);
      } else {
      curMonths = months.slice(curStartDate.getMonth(), curEndDate.getMonth()+1);
      }

      for (var i = 0; i < curMonths.length; i++) {
          combinedMonths.push(curMonths[i])
      }
      setTimeout(() => {
       c3.generate({
          bindto: this.monthlyServiceCurrentGraph?.nativeElement,
          size: {
              height: 250,
              //width: 400
          },
          data: {
            columns: this.monthlyServiceCurrentData,
            colors: this.graphColor
          },
          axis: {
            x: {
              label: {
                text: 'Months',
                position: "outer-center",
              },
              tick: {
                centered: true,
                //rotate: 30,
              },
              type: 'category',
              categories:combinedMonths,
             },
            y: {
              label: {
                text: 'Monthly Service',
                position: "outer-middle",
              },
              min: 0, padding: { bottom: 0 }, tick: {
                format: d3.format('$'),

              }
            }
          },
          grid: { x: { show: true } },
          point: { r: 0, focus: { expand: { r: 5 } } },
          tooltip: {
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
              // if (this.executiveSummaryService.executiveSummary?.executiveSummaryPrevYearlist.length) {
              return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>`
                //<div class='exc-summary-tooltip tooltip-blue'>$ ${d?.[1]?.value}</div>`;
              // } else {
              //   return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>`;
              // }

            },
          },
        });

      }, 1000);
    }
    generateGraphPrevious(){
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let prevMonths = [];
      let combinedMonths: string[] = [];
      let prevStartDate = new Date(this.prevYearStartDate);
      let prevEndDate = new Date(this.prevYearEndDate);
      prevStartDate.setMonth(prevStartDate.getMonth());
      prevEndDate.setMonth(prevEndDate.getMonth());
      if(prevStartDate.getMonth() > prevEndDate.getMonth()) {
      prevMonths = months.slice(prevStartDate.getMonth(), prevEndDate.getMonth()+13);
      } else {
      prevMonths = months.slice(prevStartDate.getMonth(), prevEndDate.getMonth()+1);
      }
      combinedMonths = [];

      for (var i = 0; i < prevMonths.length; i++) {
          combinedMonths.push(prevMonths[i])
      }
      setTimeout(() => {
       c3.generate({
          bindto: this.monthlyServicePreviousGraph?.nativeElement,
          size: {
              height: 250,
              //width: 400
          },
          data: {
            columns: this.monthlyServicePreviousData,
            colors: this.graphColor
          },
          axis: {
            x: {
              label: {
                text: 'Months',
                position: "outer-center",
              },
              tick: {
                centered: true,
                //rotate: 30,
              },
              type: 'category',
              categories:combinedMonths,
             },
            y: {
              label: {
                text: 'Monthly Service',
                position: "outer-middle",
              },
              min: 0, padding: { bottom: 0 }, tick: {
                format: d3.format('$'),

              }
            }
          },
          grid: { x: { show: true } },
          point: { r: 0, focus: { expand: { r: 5 } } },
          tooltip: {
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
              // if (this.executiveSummaryService.executiveSummary?.executiveSummaryPrevYearlist.length) {
              return`<div class='exc-summary-tooltip tooltip-blue'>$ ${d?.[0]?.value}</div>`;
                //`<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>
              // } else {
              //   return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>`;
              // }

            },
          },
        });
      }, 1000);
    }



    generateRentalCurrentGraph(){
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let curMonths = [];
      let combinedMonths: string[] = [];
      let curStartDate = new Date(this.curYearStartDate);
      let curEndDate = new Date(this.curYearEndDate);
      curStartDate.setMonth(curStartDate.getMonth());
      curEndDate.setMonth(curEndDate.getMonth());
      if(curStartDate.getMonth() > curEndDate.getMonth()) {
      curMonths = months.slice(curStartDate.getMonth(), curEndDate.getMonth()+13);
      } else {
      curMonths = months.slice(curStartDate.getMonth(), curEndDate.getMonth()+1);
      }

      for (var i = 0; i < curMonths.length; i++) {
          combinedMonths.push(curMonths[i])
      }
      setTimeout(() => {
       c3.generate({
          bindto: this.monthlyRentalCurrentGraph?.nativeElement,
          size: {
              height: 250,
              //width: 480
          },
          data: {
            columns:this.monthlyRentalCurrentData,
            colors: this.graphColor
          },
          axis: {
            x: {
              label: {
                text: 'Months',
                position: "outer-center",
              },
              tick: {
                centered: true,
              },
              type: 'category',
              categories:combinedMonths
              },
            y: {
              label: {
                text: 'Monthly Rent',
                position: "outer-middle",
              },
              min: 0, padding: { bottom: 0 }, tick: {

                format: d3.format('$')
              }
            }
          },
          grid: { x: { show: true } },
          point: { r: 0, focus: { expand: { r: 5 } } },
          tooltip: {
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
              // if (this.executiveSummaryService.executiveSummary?.executiveSummaryPrevYearlist.length) {
              return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>`
                //<div class='exc-summary-tooltip tooltip-blue'>$ ${d?.[1]?.value}</div>`;
              // } else {
              //   return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>`;
              // }

            },
          },
        });
      }, 1000);
    }
    generateRentalPreviousGraph(){

      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let prevMonths = [];
      let combinedMonths: string[] = [];
      let prevStartDate = new Date(this.prevYearStartDate);
      let prevEndDate = new Date(this.prevYearEndDate);
      prevStartDate.setMonth(prevStartDate.getMonth());
      prevEndDate.setMonth(prevEndDate.getMonth());
      if(prevStartDate.getMonth() > prevEndDate.getMonth()) {
      prevMonths = months.slice(prevStartDate.getMonth(), prevEndDate.getMonth()+13);
      } else {
      prevMonths = months.slice(prevStartDate.getMonth(), prevEndDate.getMonth()+1);
      }
      combinedMonths = [];

      for (var i = 0; i < prevMonths.length; i++) {
          combinedMonths.push(prevMonths[i])
      }
        setTimeout(() => c3.generate({
        bindto: this.monthlyRentalPreviousGraph?.nativeElement,
        size: {
          height: 250,
          //width: 480
        },

        data: {
          columns: this.monthlyRentalPreviousData,
          colors: this.graphColor
        },

        axis: {
          x: {
            label: {
              text: 'Months',
              position: "outer-center",
            },
            tick: {
              centered: true,
            },

            type: 'category',
            categories: combinedMonths
          },
          y: {
            label: {
              text: 'Monthly Rent',
              position: "outer-middle",
            },
            min: 0, padding: { bottom: 0 }, tick: {
              format: d3.format('$')
            }
          }
        },
        grid: { x: { show: true } },
        point: { r: 0, focus: { expand: { r: 5 } } },
        tooltip: {
          contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
            // if (this.executiveSummaryService.executiveSummary?.executiveSummaryPrevYearlist.length) {
            return `<div class='exc-summary-tooltip tooltip-blue'>$ ${d?.[0]?.value}</div>`;
          },
        },
      }), 1000);
    }


    generateBarGraph(){
      setTimeout(() => {
        c3.generate({
          bindto: this.spendByClaimTypeBarGraph?.nativeElement,
          size: {
                   height: 250,
                   // width: 480
                },
          data: {
            columns: this.spendByClaimData,
            colors: this.graphColor,
            type: 'bar'
        },
          bar: {
            width: {
                ratio: 0.7
            }

        },
        axis: {
          x: {
            label: {
              text: 'Claim Type',
              position: "outer-center",
            },

          type: 'category',
          categories:["Normal Repairs" , "Parts Only","PM","Avoidable","Rental"],
            tick: {

              format: '%b%Y'
            }
          },
          y: {
            label: {
              text: "Value",
              position: 'outer-middle'
            }
            }
        }
    });
    },1000);
    }

    /** Generate Top 10 Totals by Asset */
    generatePieChart(){
      setTimeout(() => {
        if(!this.donutChart){
            this.donutChart = c3.generate({
              bindto: this.top10TotalsPieChart?.nativeElement,
              data: {
                  columns: this.pieChartData,
                  colors: this.donutChartColors,
                  type : 'donut',
                  onclick: function (d, i) { console.log("onclick", d, i); },
                  onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                  onmouseout: function (d, i) { console.log("onmouseout", d, i); }
              },
              tooltip: { show: true },
              legend: {
                show: false,
                position: 'right'
            },
              donut: {
                label: { format(value, ratio, id): string { return ''; } },

              }
          });
        }

      })


    };
    calculatePercentage(value:number){
       return (value / this.pieTotal);
    }

    public legendMouserover(id: any): void {
      this.donutChart.focus(id);
    }
    public legendMouseOut(): void {
      this.donutChart.revert();
    }
    addnumbers(x:any,y:any){
      return Number(x)+Number(y);
    }
    percentage(x:any,y:any){
      return x/y;
    }
    private _genereateReportPdfDownloadPayload(billingId: string[]) {
       return {
        billingId: '',
        // invoiceNumber, invoiceTotalAmt: null
      };
    }
    downloadPDF(): void {
      const data = this._genereateReportPdfDownloadPayload(this.billingId);
      this.reportData.getReportPdf(data);

    }
  }










