import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ServicehistoryComponent } from '../claim-type/servicehistory/servicehistory.component';
import { UserPreAccess } from '../login/login.interface';
import { Dropdown, DropDownData } from '../shared/components/multiselect/dropdown.interface';
import { SearchInput } from '../shared/components/search/search.interface';
import { DEFAULT_ROWS_PER_PAGE, PagionationOffset } from '../shared/components/table/pagination/pagination.interface';
import { ColumnDefs, ExpColumDef, TableSettings } from '../shared/components/table/table.interface';
import { AUTHKEY } from '../shared/constants/auth.constant';
import { NOTIFICATION_MSG } from '../shared/constants/notification.constant';
import { claimTypeSearch } from '../shared/constants/searchTab.constant';
import { CLAIMTYPE_WO_LIST_COLUMNS } from '../shared/constants/table.constant';
import { BillId, BillingId, ShippingDetail } from '../shared/interfaces/billid.interface';
import {  claimTypeListSearch, claimTypeWOList, getClaimTypeMetadataRequest, serviceHistoryModal, ShippingIdMetadataResponse } from '../shared/interfaces/claim-type.interface';
import { BillingIdService } from '../shared/services/billing-id.service';
import { LoaderService } from '../shared/services/loader.service';
import { NotificationService } from '../shared/services/notification.service';
import { UserService } from '../shared/services/user.service';
import { UtlilityService } from '../shared/services/utlility.service';
import { ClaimTypeService } from './claim-type.service';
@Component({
  selector: 'app-claim-type',
  templateUrl: './claim-type.component.html',
  styleUrls: ['./claim-type.component.scss']
})
export class ClaimTypeComponent implements OnInit  {
  claimtypeColumns: Array<ColumnDefs> = CLAIMTYPE_WO_LIST_COLUMNS as Array<ColumnDefs>;
 // claimtypeExpColumns: Array<ExpColumDef> = TOPASSET_LIST_EXP_COLUMNS as Array<ExpColumDef>;
  claimtypeRows: Observable<claimTypeWOList[] | null> = of([]);
  claimtypeSettings: TableSettings = { expandable: false, selectable: false, localSort: true };
  @Input() rowData: Array<any> = [];
  @Output() repairDdlChange = new EventEmitter<BillId>();
  @ViewChildren('datePicker') datePicker: any;
  claimTypeDdl:any={};
  billingId: Array<string> = [];
   shippingId: Array<string> = [];
  @Input() show = '';
  val:any;
  selectedAdminBillingId = '';
  selectedAdmingShippingId = '';
    isAdmin = false;
    billingIdDdl: Dropdown = {
      multi: true,
      placeholder: 'Billing ID',
      data: []
    };
    shippingIdDdl: Dropdown = {
      multi: false,
      placeholder: 'Shipping ID',
      data: []
    };
  dateObj:any={};
  maxDate = new Date();
  startDate:Date | string ='';
  endDate:Date | string ='';
  fromDate:Date | string ='';
  toDate:Date | string ='';
  shipId='';
  selectedShipToRows: ShippingDetail[] = [];
  shippingIdMetaData: BillingId[]=[] ;
  loader = false;
  firstName: string = this.user.getUserDetails()?.userFName || '';
  lastName: string = this.user.getUserDetails()?.userLName || '';
  userPrivilage: UserPreAccess[] = this.user.getUserDetails()?.userPreAccess || [];
  userType: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  claimTypeList: claimTypeWOList[] = [];
  claimType:any={};
  claimTypeLists: serviceHistoryModal[] = [];
  private searched = false;

  searchData: claimTypeListSearch | undefined = {
    fromDate: null, toDate: null
  };
  offset: PagionationOffset = { limitList: DEFAULT_ROWS_PER_PAGE, offsetList: 0 };
  searchInput: Array<SearchInput> = new claimTypeSearch().tab as Array<SearchInput>;
  private unSubscribe$ = new Subject();
  selectedAdminShipToRows: any[]=[];
  selectedAdminShipingId: any;
  constructor(
    private loaderService: LoaderService,
    private billingIdService: BillingIdService,
    private claimTypeData:ClaimTypeService,
    private user: UserService,
    private notification: NotificationService,
    private router: Router,
    public dialog: MatDialog,
    private utlilityService: UtlilityService,


  ) { }


  ngOnInit(): void {
    // this.getShippingId();

    const userBillIds = this.user.getUserDetails()?.userBillIds || [];
    this.getShippingDl(userBillIds);
    this.isAdmin = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN;
    this.billingIdDdl.data = userBillIds?.map(({ billTo, billToAddress, billToName }) =>
      ({ key: billTo, value: `${billTo} | ${billToName} | ${billToAddress}` }));

    const { id, name } = this.billingIdService.restoreSelectedBillingId();
    this.selectedAdminBillingId = this.isAdmin ? name : '';
    this.selectedAdmingShippingId = this.isAdmin?name:'';
    if (id) {
      this.billingId = id;
      this.billingIdService.emitBillingId(id, name);
    } else {
      const initialSelectedIds = userBillIds?.map(({ billTo }) => billTo);
      this.billingIdService.emitBillingId(initialSelectedIds);
      this.getShippingDl(userBillIds);
      this.billingId = initialSelectedIds;
    }
   if(!this.isAdmin){
    this.billingIdService.getBillingId().subscribe(res=>{
      this.billingId = res;
      console.log(this.billingId,"??>?");
      this.getShippingDl(userBillIds);
      //console.log('billing ID changed')
    });
   }

  }
    /*onDateSelected(){
      this._initData();
  }*/

getShippingDl(userBillIds: any[]){
  this.selectedShipToRows = [];
  // this.shippingIdDdl.data = [];
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
    console.log(this.selectedShipToRows,"???>>>>><<<<>?????",);
}

_initData(): void {
  // this.getShippingId();
  this.getClaimTypeList();
  this.getClaimType();
 }

//  getShippingId(){
//   const shipIdReq = {
//     billingId: this.billingId,
//   }
//   console.log(shipIdReq,"jshj",this.billingId);

//   this.claimTypeData.getAllBillingId({billingId:'13685'}).subscribe((response:any) => {

//     this.shippingIdMetaData = response;
//     console.log(response);
//     let shipData = response.billIds[0].details;

//     this.shippingIdDdl.data.push(shipData);
//     console.log(this.shippingIdDdl.data,"??????????????",this.billingIdDdl.data);
      /*this.selectedShipToRows = [];
      if (this.shippingIdMetaData.returnCode === 0) {
        const shippingList: DropDownData[] = [];
          this.shippingIdMetaData.billIds.forEach(((data: { shipTo: string; location: any; billTo: any; billToAddress: any; billToName: any; details: any; }) => {
            shippingList.push({ key: data.shipTo, value: data.location });
          this.claimTypeData.getSelectedShipIdToCreateRequest().forEach(element => {
            if (data.shipTo === element) {
              this.selectedShipToRows.push({
                billTo: data.billTo,
                billToAddress: data.billToAddress,
                billToName: data.billToName,
                details: data.details

              });
            }
          });
        }),
        this.shipIdDdl = { ...this.shipIdDdl, data: [...shippingList] });
        if (this.selectedShipToRows.length > 1) {
          this.claimTypeData.setSelectedShipIdToCreateRequest([]);
        }
      }*/
//   }, error =>{
//     console.log(error);
//     this.loaderService.hide();
//   })
// }
 public getClaimTypeList() {

  this.startDate=new Date(this.dateObj.startDate);
   this.endDate=new Date(this.dateObj.endDate);

  //this.loaderService.show();
  const claimTypeWORequest = {
          billingId: this.billingId,
          //shippingId:this.shipId,
          fromDate: new Date(this.startDate).
          toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          toDate: new Date(this.endDate).
          toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    }
  this.claimTypeData.getClaimTypeList(claimTypeWORequest).subscribe((response:any) => {

    for(let i=0;i<response.claimTypeList.length;i++){
      if(!response.claimTypeList[i].claimCode) {
        response.claimTypeList[i].claimCode = '';
      }
    }
    //console.log(response.claimTypeList);
    this.claimType = response;
    this.claimtypeRows = of(response.claimTypeList);
    //console.log(response);
    //this.loaderService.hide();
  }, error =>{
    console.log(error);
    this.loaderService.hide();
  })
 }

public getClaimType() {
  this.loaderService.show();
  const getClaimTypeMetadataRequest = {
          billingId: this.billingId,

    }
  this.claimTypeData.getClaimType(getClaimTypeMetadataRequest).subscribe((response:any) => {
     this.claimTypeDdl=response.metadata;
  this.loaderService.hide();
  }, error =>{
    console.log(error);
    //this.loaderService.hide();
  })
}
private _handleApiResponse(response: any, onlyList: boolean): void {
   this.claimTypeLists = response;
  if (!onlyList) {
    this.claimTypeLists = response[0];
  }
     else {
    this.claimTypeLists = response;
  }
}

private _resetSearchForm(): void {
  this.searched = true;
  this.searchData = {  fromDate: null, toDate: null };
  this.searchInput[4].value = [];
  this.searchInput = JSON.parse(JSON.stringify(this.searchInput));
}


private _validateSearchForm(value: claimTypeListSearch): boolean {
  const isValid = Object.values(value).some(item => item ?? (!Array.isArray(item) || item.length));
  if (!isValid) {
    this.notification.showNotification(NOTIFICATION_MSG.searchFormNotValid);
    return false;
  }
   if(value.toDate && !value.fromDate){
    this.notification.showNotification(NOTIFICATION_MSG.yearNotValid);
      return false;
   }
  if (value.toDate && value.fromDate) {
    if (this.utlilityService.checkFromGreaterThanToDates(value.fromDate, value.toDate)) {
      this.notification.showNotification(NOTIFICATION_MSG.dateValidation);
      return false;
    }
  }
  return true;
}
onSearch(value:any){
  this.dateObj=value;
  console.log(this.dateObj);
  this._initData();
}

onSearchClear(): void {
  const isNotEmptySearchForm = !!this.searchData
    && Object.values(this.searchData).some(value => value ?? (!Array.isArray(value) || value.length));
  if (isNotEmptySearchForm) {
    this._resetSearchForm();
  }
}
changeBillingId(): void {
  this.billingIdService.emitBillingId(this.billingId);
}
changeShippingingId(){
console.log("ghjkl");

}
onChnage(event:any){
  console.log(event,":}}");

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
  console.log(bill,"%%%%%%%%%%%%");
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
    console.log(this.selectedAdminShipToRows,"::::::::::::");

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
  console.log(this.shippingIdDdl,"????");
}
onBillingIdChange(event: any, bill: any): void {
  if (event.source._selected) {
    this.selectedAdminShipingId = event.source.value;
  }
}

public moreClaimTypeDetails(item: claimTypeWOList): Observable<any> {
  const dialogRef = this.dialog.open(ServicehistoryComponent, {
    width: '100%',
    //  height: '100vw',
    panelClass: 'custom-dialog-container',
    data: item
  });
  return dialogRef.afterClosed();
}
changeDdlValue(item:any,rowData:any){
  const userDetails = this.user.getUserDetails();
   const saveWOClaimTypeReq={
    claimCode:item.target.value,
    workOrderId:rowData.workOrderId,
    userCode:'',
    claimChangeUserCode: userDetails?.userCode || '',
    userType:''

  }
  this.claimTypeData.saveWOClaimType(saveWOClaimTypeReq).subscribe(({ returnCode, returnMsg }) => {
    //this.notification.showNotification(returnMsg);
    if (returnCode === 0) {
      this.notification.showNotification(returnMsg);
      //this.notification.showNotification(NOTIFICATION_MSG.clamTypeAdded);
      this.router.navigateByUrl('/claim-type');

    }
  }, error =>{
    console.log(error);
    //this.loaderService.hide();
  })
}
}

















