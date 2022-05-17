export interface KpiReportMetadata {
  keyField: string;
  valueField: string;
}
export interface KpiReportMetadataRes {
  returnCode: number;
  returnMsg: string;
  executionTime: string;
  metadata: KpiReportMetadata[];
}
export interface KpiRequest extends KpiFilter {
  billingId: string[];
  equipmentNo: string[];
  kpid: string;
  location: string[];
}
export interface KpiFilter {
  fromDate: string | Date | null;
  isPMWO: string  | number |null;
  toDate: string | Date | null;
}
export class KpiReport {
  days: number | null = null;
  executionTime = '';
  hours: number | null = null;
  minutes: number | null = null;
  percentage: number | null = null;
  returnCode = 0;
  returnMsg = '';
  seconds: number | null = null;
}
