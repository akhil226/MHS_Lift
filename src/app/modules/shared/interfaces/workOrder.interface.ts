export interface WorkOrderListResponse {
  executionTime: string;
  returnCode: number;
  returnMsg: string;
  totalRows: string;
  wolist: WorkOrder[];
}

export interface WorkOrder {
  createdDate: string;
  equipmentSrNo: string;
  lastStatusChange: string;
  partsETA: string;
  statusCode: string;
  unitNo: string;
  woDescription: string;
  woID: string;
  woType: string;
  wopdfPath: string;
}
export interface  WorkOrderStatusGraphRequest {
  location: string[];
  billingId: string[];
  isPM: number;
}

export interface WorkOrderStatusGraphResponse {
  executionTime: string;
  returnCode: number;
  returnMsg: string;
  wostatuslist: WoStatus[];
  wostatusMap: WostatusMap[];
}

export interface WoStatus {
  assignedCount: string;
  dispatchedCount: string;
  incompleteNeedQuoteCount: string;
  incompletePartsAvailableCount: string;
  incompletePartsNeededCount: string;
  incompletePartsOrderedCount: string;
  incompletePartsPickedupCount: string;
  incompleteTimeCount: string;
  incompleteWarrantyReturnCount: string;
  newCount: string;
  totalCount: string;
}

export interface WoStatusAndMap extends WoStatus{
  wostatusMap: WostatusMap[];
}
export interface WostatusMap {
  keyField: string;
  valueField: string;
}
export class WorkOrderStatusGraph {
  columns: any[] = [];
  colors: { [key: string]: string } = {};
  total: string | undefined;
  type: string | undefined;
  wostatusMap: WostatusMap[] = [];
}


export interface WorkOrderListRequest extends WorkOrderListSearch {
  billingId: string[];
  limitList: number;
  offsetList: number;
  orderBy: string;
}
export interface WorkOrderListSearch {
  equipSRNO: string | null;
  fromDate: string | null;
  toDate: string | null;
  woID: string | null;
  woStatus: string[];
  location: string[];
  isPM: number;
}

export interface WorkOrderStatusMetadata {
  executionTime: string;
  metadata: WorkOrderStatus[];
  returnCode: number;
  returnMsg: string;
}

export interface WorkOrderStatus {
  keyField: string;
  valueField: string;
}
