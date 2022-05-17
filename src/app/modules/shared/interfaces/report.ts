export interface MhecostRequest {
    curYearFromDate: string;
    curYearToDate: string;
    prevYearFromDate: string;
    prevYearToDate: string;

}

export interface MhecostResponse extends MHECost{

    currentMHECostCurYear: string[];
    currentMHECostPreYear: string[],
    executionTime: string;
    returnCode: number;
    returnMsg: string;

}
 export interface MHECost{
    total: string;
    totalParts: string;
    totalRent: string;
    totalService: string;
 }
 export interface MHECostTable{
  period:string,
  totalTruckSpend:string,
  totalRentalSpend:string
}
export interface fleetCompoTable{
  period:string,
  activeUnitsServiced:string,
  averageCostPerUnit:string
}
export interface fleetInterface{
  avgCostPerUnit: string,
  equipCount: string,
  total: string,
  totalParts: string,
  totalService: string
}
export interface avoidableSpendTable{
  period:string,
  totalOperatorError:string,
  percentTotalSpend:string
}
export interface avoidable{

  total: string,
  totalParts: string,
  totalRent: string,
  totalService: string
}

 export interface monthlyServiceModel{
    amount: number;
    month: number;
    year: number;

 }

 export interface monthlyServiceGraphModel{
    monthlyServiceModalList: monthlyServiceModel[] |[];
    xAxisValue: string[] | [];
    currentYear: number[] | [];
    previousYear: number[] | [];
 }

 export interface topAssetList{
   assetNo:string,
   equipmake:string,
   equipmodel:string,
   equipyear:string,
   lastMeter:string,
   locationPercentage:string,
   locationSpend:string,
   serialNo:string,
   shipToId:string,
   totalSpend:string


 }


 export interface fleetAssetSummary{
  amountLabor: string,
  amountOther: string,
  amountParts: string,
  amountTax: string,
  amountTotal: string,
  regularRepair:string,
  pm:string,
  wheelsTires:string,
  batteryCharge:string,
  majorRepair:string,
  damageMissuse:string,
  annHr: string,
  assetNo: string,
  costperHour:string,
  equipAge: string,
  equipMake: string,
  equipModel: string,
  equipYear: string,
  firstMeter: string,
  firstOrderDate: string,
  lastMeter: string,
  lastOrderDate: string,
  serialNo: string,
  varDays: string,
  varHrs: string,
  }
  export interface fleetAssetReq extends fleetAssetSummary {
    billingId: string[];
    userCode:string,
    userType:string
  }
  export interface fleetAssetRequest extends fleetAssetSummary {
    billingId: string[],
    fromDate:string,
    toDate:string,
    shipId:string,
    location:string,
    userCode:string,
    userType:string
  }
  export interface fleetAssetSummaryResp{
    executionTime:string,
    fleetAssetSummaryList: [],
    returnCode: 0,
    returnMsg: string
  }
export interface ReportListSearch{
  CurFromDate: string| null,
   CurToDate: string| null,
   prevFromDate: string| null,
   prevToDate: string| null
}
