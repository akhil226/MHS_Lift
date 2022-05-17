export interface InvoiceListRequest {
  billingId: string[];
  department: string[];
  fromDate: string | null;
  invoiceNo: string | null;
  invoiceStatus: string | null;
  limitList: number;
  location: string[];
  offsetList: number;
  orderBy: string | null;
  toDate: string | null;
}

export interface InvoiceListResponse {
  executionTime: string;
  invoiceList: Invoice[];
  returnCode: number;
  returnMsg: string;
  totalRows: string;
}

export interface Invoice {
  departmentId: string;
  departmentName: string;
  equipManufr: string;
  equipModel: string;
  equipSerialNo: string;
  invoiceDate: string;
  invoiceDueAmt: string;
  invoiceFileCount: string;
  invoiceId: string;
  invoiceNetAmt: string;
  invoiceNumber: string;
  invoicePaidStatus: string;
  invoiceTaxAmt: string;
  invoiceTotAmt: string;
  totalRows: string;
  unitNumber: string;
  workOrderId: string;
  equipLocation: string;
  poId: string;
  invoicePaidAmt: string;
  wopdfPath: string | '';
}

export interface InvoiceListReq extends InvoiceListSearch {
  billingId: string[];
  limitList: number;
  offsetList: number;
  orderBy: string;
}
export interface InvoiceListSearch {
  department: string[];
  fromDate: string | null;
  invoiceNo: string | null;
  invoiceStatus: string | null;
  toDate: string | null;
  location: string[];
  woID: string | null;
}

export interface DepartmentList {
  departmentId: string;
  departmentName: string;
}
export interface DepartmentMetaData {
  executionTime: string;
  departmentList: DepartmentList[];
  returnCode: number;
  returnMsg: string;
}
export interface InvoicePdfDownload {
  departId: string;
  invoiceNumber: string[];
  invoiceTotalAmt: number | null;
}
