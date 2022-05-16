export interface ShippingDetail {
  [x: string]: any;
  company: string;
  location: string;
  shipTo: string;
  selected?: boolean;
}
export interface BillId {
  billTo: string;
  billToAddress: string;
  billToName: string;
  details: ShippingDetail[];
}
export interface BillingId {
  returnCode: number;
  returnMsg: string;
  executionTime: string;
  billIds: BillId[];
}
export interface BillingIdRequest {
  billingId: string;
}

