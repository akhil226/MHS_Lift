export interface ServiceReportsMetadata {
  keyField: string;
  valueField: string;
}
export interface ServiceReports {
  metadata: ServiceReportsMetadata[];
  returnCode: number;
  returnMsg: string;
}
export interface ServiceReportReq {
  location: string[];
  billingId: string[];
  fromDate: string;
  userName: string;
  serialNoUnitNo: string;
  serviceDetailId: string;
  toDate: string;
  woPdfPath: string;
}
