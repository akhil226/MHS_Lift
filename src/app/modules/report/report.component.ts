import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Dropdown } from './../shared/components/multiselect/dropdown.interface';
import { SubHeaderComponent } from '../home/sub-header/sub-header.component';
import { UserPreAccess } from '../login/login.interface';
import { AUTHKEY } from '../shared/constants/auth.constant';
import { BillingIdService } from '../shared/services/billing-id.service';
import { UserService } from '../shared/services/user.service';
import { NotificationService } from '../shared/services/notification.service';
import { BillId, ShippingDetail } from '../shared/interfaces/billid.interface';
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
     //private unSubscribe$ = new Subject();
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
  topAssetRows:topAssetList[]  = [];
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
  arrayData: any[] = [];
  selectedAdminShipingId: any ='';
  selectedAdminShipToRows: any[]=[];
  values: any;
  valuArray: any;
    constructor(
      private billingIdService: BillingIdService,
      private user: UserService,
      private reportData:ReportService,
      private notification: NotificationService,
      private utlilityService: UtlilityService,
      private loaderService: LoaderService,

    ) {  }

    ngOnInit(): void {
      console.log("this on onot");
      this.generatePieChart();
      this.curYearStartDate =new Date();
      this.curYearEndDate =new Date();
      this.curYearStartDate.setMonth(this.curYearStartDate.getMonth() - 6);
      this.prevYearStartDate=new Date();
      this.prevYearStartDate.setMonth(this.curYearEndDate.getMonth() - 6);
      this.prevYearEndDate=new Date();
      this.prevYearStartDate.setMonth(this.prevYearStartDate.getMonth() - 12);
      this.prevYearEndDate.setFullYear(this.prevYearStartDate.getFullYear() - 1);
      const userBillIds = this.user.getUserDetails()?.userBillIds || [];
      this.getShippingDl(userBillIds);
      this.isAdmin = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN;
      this.billingIdDdl.data = userBillIds?.map(({ billTo, billToAddress, billToName }) =>
        ({ key: billTo, value: `${billTo} | ${billToName} | ${billToAddress}` }));
      const { id, name } = this.billingIdService.restoreSelectedBillingId();
      this.selectedAdminBillingId = this.isAdmin ? name : '';
      console.log(this.selectedAdminBillingId,"on init");

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
          console.log("its comie ebger");

          this.billingId = res;
          this.getShippingDl(userBillIds);
          //this._initData();
        });
      }


    }
    _initData(): void {
      this.generatePieChart();
///
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
    clearForm(){

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
          //this.monthlyRentalData=response;
          this.monthlyRentalCurrentData=[
            ['Current'],
            //['Previous']
          ];
          for (let j = 0; j < response.monthlyRentalComparisonCurYearlist.length ; j++){
          this.monthlyRentalCurrentData[0].push(Number(response.monthlyRentalComparisonCurYearlist[j].totalRent).toFixed(2));
          //this.monthlyRentalPreviousData[1].push(Number(response.monthlyRentalComparisonPreYearlist[j].totalRent).toFixed(2));
           }
           this.generateRentalCurrentGraph();
           this.monthlyRentalPreviousData=[
            //['Current'],
            ['Previous']
          ];
          for (let j = 0; j < response.monthlyRentalComparisonPreYearlist.length ; j++){
            //this.monthlyRentalCurrentData[0].push(Number(response.monthlyRentalComparisonCurYearlist[j].totalRent).toFixed(2));
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
        //console.log(response)
        this.graphColor = {};
        this.monthlyServiceCurrentData = [
          ['Current'],
          //['Previous']
        ];
        for (let i = 0; i < response.monthlyServiceComparisonCurYearlist.length ; i++){
          this.monthlyServiceCurrentData[0].push(Number(response.monthlyServiceComparisonCurYearlist[i].totalService).toFixed(2));
          this.graphColor = { 'Current': '#912728' };
          /*this.monthlyServiceData[1].push(Number(response.monthlyServiceComparisonPreYearlist[i].totalService).toFixed(2));
          this.graphColor = {
            ...this.graphColor, 'Previous': '#2e97fd'
          };*/
        }
        this.generateGraphCurrent();
        this.monthlyServicePreviousData = [
          //['Current'],
          ['Previous']
        ];
        for (let i = 0; i < response.monthlyServiceComparisonPreYearlist.length ; i++){
          //this.monthlyServicePreviousData[0].push(Number(response.monthlyServiceComparisonCurYearlist[i].totalService).toFixed(2));
          //this.graphColor = { 'Current': '#912728' };
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
        //console.log(response)

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
      const topAssetTotalsRequest = {
        billingId: this.billingId,
        curYearFromDate: new Date(this.curYearStartDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        curYearToDate: new Date(this.curYearEndDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        orderBy: this.orderBy
      }
      this.pieChartData = [];
      this.reportData.top10AssetTotals(topAssetTotalsRequest).subscribe((response:any) => {
       //console.log(response)
       this.topAssetTotal=response
       for (let j= 0; j< 10; j++) {
        this.truckServiceSum=this.truckServiceSum+Number(this.topAssetTotal.serviceAssets[j].amountTotal? this.topAssetTotal.serviceAssets[j].amountTotal : 0)
         this.sum=this.sum+Number(this.topAssetTotal.serviceAssets[j].amountTotal? this.topAssetTotal.serviceAssets[j].amountTotal : 0)
       }

       const colors = ['#5668e2', '#56aee2', '#e28956', '#8a56e2', '#e25668', '#cf56e2', '#e2cf56', '#56e2cf', '#e256ae', '#68e256'];
      for (let i = 0; i <=10 ; i++) {
        this.pieChartData.push([
          response.serviceAssets[i].assetNo ,
          response.serviceAssets[i].amountTotal,
          response.serviceAssets[i].serialNo,
          // response.serviceAssets[i].amountTotal
        ]);
        this.donutChartColors[
          response.serviceAssets[i].assetNo


      ] = colors[i];
        this.pieTotal = Number(this.pieTotal) + Number(response.serviceAssets[i].amountTotal);
        // this.generatePieChart();

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
       // console.log(response)
        this.avoidableSpend=response;
        if(this.avoidableSpend.avoidableSpendCurYear){
        this.currentPercentTotal=(this.avoidableSpend.avoidableSpendCurYear[0].total /this.avoidableSpend.avoidableSpendCurYear[0].totalService);
        this.previousPercentTotal=(this.avoidableSpend.avoidableSpendPreYear[0].total/this.avoidableSpend.avoidableSpendPreYear[0].totalService);
        console.log(this.currentPercentTotal, this.previousPercentTotal );

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
        //console.log(this.avoidablear);

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
      this.topAssetRows = response.topAssetList;
      this.loaderService.hide();
    }, error =>{
      console.log(error);
      this.loaderService.hide();
    })
  }

/*const fleetAssetSummaryRequest: fleetAssetRequest= {
      billingId: this.billingId,

      fromDate: '',
      toDate: '',
      shipId: '',
      location:'',
      userCode: '',
      userType: '',
      amountLabor: '',
      amountOther: '',
      amountParts: '',
      amountTax: '',
      amountTotal: '',
      regularRepair: '',
      pm: '',
      wheelsTires: '',
      batteryCharge: '',
      majorRepair: '',
      damageMissuse: '',
      annHr: '',
      assetNo: '',
      costperHour: '',
      equipAge: '',
      equipMake: '',
      equipModel: '',
      equipYear: '',
      firstMeter: '',
      firstOrderDate: '',
      lastMeter: '',
      lastOrderDate: '',
      serialNo: '',
      varDays: '',
      varHrs: ''
    }
    this.reportData.getFleetAssetSummary(fleetAssetSummaryRequest).subscribe((response:fleetAssetSummaryResp) => {
*/


  public getFleetAssetSummary() {

    //this.loaderService.show();
    const fleetAssetSummaryRequest = {
      billingId: this.billingId,
      curYearFromDate: new Date(this.curYearStartDate).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      curYearToDate: new Date(this.curYearEndDate).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),

    }
    this.reportData.getFleetAssetSummary(fleetAssetSummaryRequest).subscribe((response:any) => {

      this.fleetAssetSummaryData=response.fleetAssetSummary
      for (let j= 0; j<this.fleetAssetSummaryData.length ; j++){
          /*if(Number.isFinite(Number(this.fleetAssetSummaryData[j].amountTotal ?this.fleetAssetSummaryData[j].amountTotal: 0) / (Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs: 0)))) {
            this.fleetAssetSummaryData[j].costPerHr = Number(this.fleetAssetSummaryData[j].amountTotal ?this.fleetAssetSummaryData[j].amountTotal: 0) / (Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs: 0));
          }*/
          // console.log( this.fleetAssetSummaryData);
          this.fleetAssetSummaryData[j].amountLabor = '$'+Number(this.fleetAssetSummaryData[j].amountLabor);

          if(Number.isFinite(Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs: 0) / (Number(this.fleetAssetSummaryData[j].varDays ?this.fleetAssetSummaryData[j].varDays: 0)))) {
            this.fleetAssetSummaryData[j].annHr = Number(Number(this.fleetAssetSummaryData[j].varHrs ?this.fleetAssetSummaryData[j].varHrs:0)  / Number(this.fleetAssetSummaryData[j].varDays ?this.fleetAssetSummaryData[j].varDays: 0))*365;
          }
      }
      this.fleetAssetSummaryRows = of(this.fleetAssetSummaryData);

      for (let j= 0; j<this.fleetAssetSummaryData.length ; j++) {
        //console.log(this.fleetAssetSummaryData[j].costPerHr);
        this.totalCharges=this.totalCharges+Number(this.fleetAssetSummaryData[j].amountTotal? this.fleetAssetSummaryData[j].amountTotal : 0)
        this.serialNumbers=this.fleetAssetSummaryData.length;
        this.costPerUnit=this.costPerUnit+Number(this.fleetAssetSummaryData[j].costPerHr? this.fleetAssetSummaryData[j].costPerHr : 0);
      }


      //console.log(this.serialNumbers)
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
    /*curYearStartDate,
    curYearEndDate
    limitList,
    offsetList,
    orderBy: this.orderBy*/

  };
}
    changeBillingId(): void {
      console.log("change is wokring");

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
    }
    /** Generate Graph */
    generateGraphCurrent(){
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let curMonths = [];
      let prevMonths = [];
      let combinedMonths: string[] = [];
      console.log(months);

      let curStartDate = new Date(this.curYearStartDate);
      let curEndDate = new Date(this.curYearEndDate);
      curStartDate.setMonth(curEndDate.getMonth() - 6);

      let prevStartDate = new Date(this.prevYearStartDate);
      let prevEndDate = new Date(prevStartDate);
      prevStartDate.setMonth(curStartDate.getMonth() - 6);
      prevEndDate.setMonth(curStartDate.getMonth() - 12);

      if(curStartDate.getMonth() > curEndDate.getMonth()) {
      curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+13);
      } else {
      curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+1);
      }

      if(prevStartDate.getMonth() > prevEndDate.getMonth()) {
      prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+13);
      } else {
      prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+1);
      }


      /* console.log(
        curStartDate.getMonth(),
        curEndDate.getMonth(),
        prevStartDate.getMonth(),
        prevEndDate.getMonth()
      ) */

      //console.log(curMonths, prevMonths);


      for (var i = 0; i <= curMonths.length; i++) {
          combinedMonths.push(curMonths[i])
      }

      /** Use the combined months for labels*/
      //console.log(combinedMonths)


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
       // console.log(chart, this.monthlyServiceGraph);
      }, 1000);
    }
    generateGraphPrevious(){
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let curMonths = [];
      let prevMonths = [];
      let combinedMonths: string[] = [];
      console.log(months);

      let curStartDate = new Date(this.curYearStartDate);
      let curEndDate = new Date(this.curYearEndDate);
      curStartDate.setMonth(curEndDate.getMonth() - 6);

      let prevStartDate = new Date(this.prevYearStartDate);
      let prevEndDate = new Date(prevStartDate);
      prevStartDate.setMonth(curStartDate.getMonth() - 6);
      prevEndDate.setMonth(curStartDate.getMonth() - 12);

      if(curStartDate.getMonth() > curEndDate.getMonth()) {
      curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+13);
      } else {
      curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+1);
      }

      if(prevStartDate.getMonth() > prevEndDate.getMonth()) {
      prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+13);
      } else {
      prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+1);
      }

      //console.log(curMonths, prevMonths);

      combinedMonths = [];

      for (var i = 0; i <= curMonths.length; i++) {
          combinedMonths.push(prevMonths[i])
      }

      /** Use the combined months for labels*/
      //console.log(combinedMonths)


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
       // console.log(chart, this.monthlyServiceGraph);
      }, 1000);
    }



    generateRentalCurrentGraph(){
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let curMonths = [];
      let prevMonths = [];
      let combinedMonths: string[] = [];
      console.log(months);

      let curStartDate = new Date(this.curYearStartDate);
      let curEndDate = new Date(this.curYearEndDate);
      curStartDate.setMonth(curEndDate.getMonth() - 6);

      let prevStartDate = new Date(this.prevYearStartDate);
      let prevEndDate = new Date(prevStartDate);
      prevStartDate.setMonth(curStartDate.getMonth() - 6);
      prevEndDate.setMonth(curStartDate.getMonth() - 12);

      if(curStartDate.getMonth() > curEndDate.getMonth()) {
      curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+13);
      } else {
      curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+1);
      }

      if(prevStartDate.getMonth() > prevEndDate.getMonth()) {
      prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+13);
      } else {
      prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+1);
      }



     // console.log(curMonths, prevMonths);

      for (var i = 0; i <= curMonths.length; i++) {
          combinedMonths.push(curMonths[i])
      }

      /** Use the combined months for labels*/
      //console.log(combinedMonths)


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
       // console.log(chart, this.monthlyServiceGraph);
      }, 1000);
    }
    generateRentalPreviousGraph(){

      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months = months.concat(months);
      let curMonths = [];
      let prevMonths = [];
      let combinedMonths: string[] = [];
      console.log(months);

      let curStartDate = new Date(this.curYearStartDate);
      let curEndDate = new Date(this.curYearEndDate);
      curStartDate.setMonth(curEndDate.getMonth() - 6);

      let prevStartDate = new Date(this.prevYearStartDate);
      let prevEndDate = new Date(this.prevYearEndDate);
      prevStartDate.setMonth(curStartDate.getMonth() - 6);
      prevEndDate.setMonth(curStartDate.getMonth() - 12);

      if(curStartDate.getMonth() > curEndDate.getMonth()) {
       curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+13);
      } else {
       curMonths = months.slice(curStartDate.getMonth()+1, curEndDate.getMonth()+1);
      }

      if(prevStartDate.getMonth() > prevEndDate.getMonth()) {
       prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+13);
      } else {
       prevMonths = months.slice(prevStartDate.getMonth()+1, prevEndDate.getMonth()+1);
      }





      //console.log(curMonths, prevMonths);

      combinedMonths = [];

      for (var i = 0; i <= prevMonths.length; i++) {
          combinedMonths.push(prevMonths[i])
      }

      /** Use the combined months for labels*/
      //console.log(combinedMonths)


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
      console.log(this.pieChartData,"{{{{{{{{{{{}}}}}}}}}}}}");
      let b="dsabjad"
      // setTimeout(() => {
        // if(!this.donutChart){
        //     this.donutChart = c3.generate({
        //       bindto: this.top10TotalsPieChart?.nativeElement,
        //       data: {
        //           columns: this.pieChartData,
        //           colors: this.donutChartColors,
        //           type : 'donut',
        //           onclick: function (d, i) {

        //              console.log("onclick", d, i); },
        //           onmouseover:  (d, i)=> {
        //             this.eventOnmouseClick(d);
        //              console.log("onmouseover", d, i)
        //              },
        //           onmouseout: (d, i)=>{
        //             this.tableData();
        //             console.log("onmouseout", d, i); }
        //       },

        //       tooltip: { show: true },
        //       legend: {
        //         show: false,
        //         position: 'right'

        //     },
        //       donut: {
        //         label: { format(value, ratio, id): string { return ''; } },


        //       }
        //   });

        // }
       let matrix:any[] = [
  {//cat1 - position 0
    Low: {  cost: 10, count: 5},
    Medium: {  cost: 100, count: 20},
     High: {  cost: 1000, count: 40}
  },
  {//cat2 - position 1
    Low: {  cost: 20, count: 10},
    Medium: {  cost: 200, count: 40},
     High: {  cost: 2000, count: 60}
  },
   {//cat3 - position 2
    Low: {  cost: 30, count: 20},
    Medium: {  cost: 300, count: 60},
     High: {  cost: 3000, count: 80}
  }];

  let countsData:any = [  ['Low'], ['Medium'], ['High']];
  matrix.forEach( (cat:any,index:any,arr: any)=>{
    console.log(countsData,cat);
    countsData[0].push(cat['Low']['count']);
    countsData[1].push(cat['Medium']['count']);
    countsData[2].push(cat['High']['count']);
});
       let categoriesList:any = ['cat1', 'cat2', 'cat3'];
       let riskToColor:any = {
        Low: '#9ACD32',
        Medium: '#FFD700',
        High: '#FF4500'
    };
       let datazz:any[] = [];
       datazz.push('sdf',[20, 40, 30, 10, 50]);
       datazz.push('456',[50, 50, 50, 40, 60]);
       datazz.push('456',[10, 40, 60, 25, 30]);
       datazz.push('456',[80, 60, 30, 25, 35]);
        this.donutChart = c3.generate({
          bindto: this.top10TotalsPieChart?.nativeElement,
          size: {
            height: 200
            },
          data:{
            columns: countsData,
            type: 'donut',
            colors: riskToColor,
            groups: [
                ['Low', 'Medium', 'High']
            ],
           order: null,
          //  labels: {
          //    format:function  (v:any, id:any, i:any, j:any){
          //      if(i !== undefined) {
          //        // console.log(i+" " + matrix[i][id]['cost']);
          //        return matrix[i][id]['cost'] + "$";
          //      }
          //      else return v;
          //    }},
          },
          axis: {
             rotated: true,
             x: {
              type: 'category',
              categories: categoriesList
             },
            y: {show: false}
           },

        tooltip: {
          contents: function (d:any) {
            var $$ = this, config = $$.config,text;
            console.log(d[0],"::",categoriesList[d[0].index]);
            text = "<table class='" + $$.CLASS.tooltip + "'><tr><th colspan='3'>"+categoriesList[d[0].index]+"</th></tr>";
            text += "<tr class='" + $$.CLASS.tooltipName + "'>";
            text += "<td class='name'>Risk</td>";
            text += "<td class='name'>Count</td>";
            text += "<td class='value'>Cost</td></tr>";
            console.log(d.length);

            for (let i = 0; i < d.length; i++) {
              console.log(d[i].id,[d[i].value],"::m",);
              // matrix[d[i].name][d[i].cost]
              text += "<tr class='" + $$.CLASS.tooltipName + "'>";
              text += "<td class='name'><span style='background-color:"+riskToColor[d[i].name]+"'></span>"+d[i].name+"</td>";
              text += "<td class='value'>"+d[i].value+"</td>";
              text += "<td class='value'>"+matrix[d[i].index][d[i].name][d[i]]+"$</td></tr>";
             }
            return text + "</table>";
          }
       }
      });
    };

    tableData(){
      const topAssetListRequest = {
        billingId: this.billingId,
        curYearFromDate: new Date(this.curYearStartDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        curYearToDate: new Date(this.curYearEndDate).
        toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),

      }
      this.reportData.getTopAssetList(topAssetListRequest).subscribe((response:any) => {
        this.topAssetRows = response.topAssetList;

      }, error =>{
        console.log(error);
      })
    }
    eventOnmouseClick(event:any){
    //  let sortData =  this.topAssetRows;
    //   console.log(event.name,":::::::::::::::::::::::::::::::::::::::::",this.donutChart);
      // this.topAssetRows = of([]);
  //    console.log(this.topAssetRows,"{{{{{{{{{{{}}}}}}}}}}}}}}}}}");
  //   this.topAssetRows= sortData.filter(function(data: any){
  //     return data.assetNo == event.name;
  //   })
  //  console.log( this.topAssetRows,"???????????????");


    }
    calculatePercentage(value:number){
       return (value / this.pieTotal);
    }

    public legendMouserover(id: any): void {
      console.log(id,'{}}}}');

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
    /*ngOnDestroy(): void {
      this.unSubscribe$.next();
      this.unSubscribe$.complete();
    }*/
/*    private _isInvalidDateIfAny(): boolean {
      return this.datePicker.toArray().some(({ errors }: any) => errors);
    }
    onDateSelected(): void {
      if (this._isInvalidDateIfAny()) {
        this.notification.showNotification(NOTIFICATION_MSG.inValidDateFormat);
      } else if (this.startDate && this.endDate) {
        if (this.utlilityService.checkFromGreaterThanToDates(new Date(this.startDate), new Date(this.endDate))) {
          this.notification.showNotification(NOTIFICATION_MSG.dateValidation);
        } else {
          const startDate = new Date(this.startDate).
            toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          const endDate = new Date(this.endDate).
            toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          const summaryModal = this.utlilityService.getAllMonthsbetweenDates(startDate, endDate, false);
          if (summaryModal.xAxisValue.length < 14) {
            this.executiveSummaryRequest.curYearFromDate = startDate;
            this.executiveSummaryRequest.curYearToDate = endDate;
            this.executiveSummaryRequest.prevYearFromDate = new Date(this.utlilityService.addOrSubtractYear(-1, new Date(this.startDate))).
              toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            this.executiveSummaryRequest.prevYearToDate = new Date(this.utlilityService.addOrSubtractYear(-1, new Date(this.endDate))).
              toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            this.currentYearExecutiveSummaryGraphModel = this.utlilityService.getAllMonthsbetweenDates(
              this.executiveSummaryRequest.curYearFromDate, this.executiveSummaryRequest?.curYearToDate, false);
            this.previousYearExecutiveSummaryGraphModel = this.utlilityService.getAllMonthsbetweenDates(
              this.executiveSummaryRequest?.prevYearFromDate, this.executiveSummaryRequest?.prevYearToDate, false);
            this.getBillingId(this.data.location);
          } else {
            this.notification.showNotification(NOTIFICATION_MSG.date2Validation);
          }
        }
        }*/
        /*generatePdf() {
         var data = document.getElementById('contentToConvert')as HTMLCanvasElement;;
            html2canvas(data).then(canvas => {
              let totalPages=canvas.height/842;
              var imgWidth =canvas.width ;
              var imgHeight = 900;//canvas.height * imgWidth / canvas.width;
              const contentDataURL = canvas.toDataURL('image/png')
              let pdf = new jspdf('p', 'mm', [canvas.width, 842]);
              /*for(let i=1;i<=totalPages;i++)
              {
               var imgData  = canvas.toDataURL("image/jpeg", 1.0);
               pdf.addImage(imgData,0,0,canvas.width, 842*i);
               pdf.addPage(canvas.width,842*i);
              }
              var position = 0;
              pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
              pdf.save('newPDF.pdf');
            });
          }*/
        /*var HTML_Width = 1024;
        var HTML_Height = 768;
        var PDF_Width = 1024
        var PDF_Height = 768
        var canvas_image_width = 1050;
        var canvas_image_height = 950;

        html2canvas(document.getElementById("contentToConvert") as HTMLCanvasElement,{ allowTaint:true}).then(function(canvas) {

            var imgData = canvas.toDataURL("image/jpg", 1);
            var pdf = new jspdf('p', 'px', [PDF_Height, PDF_Width]);
            pdf.addImage(imgData, 'JPEG', 20, 0, canvas_image_width,canvas_image_height);
            pdf.save("Certificate.pdf");
        });
      }*/
      generatePdf(data: HTMLElement) {
        html2canvas(data, { allowTaint: true }).then(canvas => {
         let HTML_Width = 500
         let HTML_Height = 500
         let top_left_margin = 15;
         let PDF_Width = HTML_Width + (top_left_margin * 2);
         let PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
         let canvas_image_width = HTML_Width;
         let canvas_image_height = HTML_Height;
         let totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
         canvas.getContext('2d');
         let imgData = canvas.toDataURL("image/jpeg", 1.0);
         let pdf = new jspdf('p', 'pt', [PDF_Width, PDF_Height],true);
         pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height,'','FAST');
         for (let i = 1; i < 3; i++) {
           pdf.addPage([PDF_Width, PDF_Height], 'p');
           pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height,'','FAST');
         }
          pdf.save("HTML-Document.pdf");
       });
     }
     /*async generateAllPdf() {
      const doc = new jspdf('p', 'mm', 'a4');
      const options = {
        pagesplit: true
      };
      const ids = document.querySelectorAll('[id]');
      const length = ids.length;
      for (let i = 0; i < length; i++) {
        const chart = document.getElementById(ids[i].id);
        // excute this function then exit loop
        await html2canvas(chart, { scale: 1 }).then(function (canvas) {
          doc.addImage(canvas.toDataURL('image/png'), 'JPEG', 10, 50, 200, 150);
          if (i < (length - 1)) {
            doc.addPage();
          }
        });
      }
      // download the pdf with all charts
      doc.save('All_charts_' + Date.now() + '.pdf');
    }*/


    }










