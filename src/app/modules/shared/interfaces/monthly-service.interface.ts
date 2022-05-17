export interface MonthlyServiceComparisonRequest 
{
    billingId: string[];
    curYearFromDate: string | null ;
    curYearToDate: string | null ;
    prevYearFromDate: string | null ;
    prevYearToDate: string | null ;
    
  }

  export interface MonthlyServiceComparisonResponse{
    executionTime: string;
    monthlyServiceComparisonCurYearlist:MonthlyServiceComparisonList[];
    monthlyServiceComparisonPreYearlist: MonthlyServiceComparisonList[];
    returnCode: number;
    returnMsg: string;
  }

  export interface MonthlyServiceComparisonList {
    amount: string | 0;
    month: string;
    year: string;
  }

  export interface MonthlyServiceComparisonModal {
    amount: number;
    month: number;
    year: number;
  }
  export interface MonthlyServiceComparisonGraphModel {
    monthlyServiceComparisonModalList: MonthlyServiceComparisonModal[] |[];
    xAxisValue: string[] | [];
    currentYearSummary: number[] | [];
    previousYearSummary: number[] | [];
  }