export interface ExecutiveSummaryRequest {
  billingId: string[];
  curYearFromDate: string | null;
  curYearToDate: string | null;
  prevYearFromDate: string | null;
  prevYearToDate: string |null;
  location: string[]
}



export interface ExecutiveSummaryResponse {
  executionTime: string;
  executiveSummaryCurYearlist: ExecutiveSummarylist[];
  executiveSummaryPrevYearlist: ExecutiveSummarylist[];
  returnCode: number;
  returnMsg: string;
}

export interface ExecutiveSummarylist {
  amount: string | 0;
  month: string;
  year: string;
}

export interface ExecutiveSummaryModal {
  amount: number;
  month: number;
  year: number;
}
export interface ExecutiveSummaryGraphModel {
  executiveSummaryModalList: ExecutiveSummaryModal[] |[];
  xAxisValue: string[] | [];
  currentYearSummary: number[] | [];
  previousYearSummary: number[] | [];
}
