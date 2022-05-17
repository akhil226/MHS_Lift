import { DropDownData } from "../components/multiselect/dropdown.interface";

export interface claimTypeWOList{
      claim: string,
      claimCode: string,
      custProblem: string,
      equipMake: string,
      equipModel: string,
      equipSerialNo: string,
      equipYear: string,
      technicalDiagnosis: string,
      technicianName: string,
      unitNo: string,
      workDone: string,
      workOrderDate: string,
      workOrderId: string,
      invoiceAmountTotal: string,
      invoiceID: string,
      invoiceDate: string



}

/*export interface claimTypeMetadata {
  keyField: string;
  valueField: string;
}*/
export interface claimTypeMetadata {
  claimList: DropDownData[];
}
export interface getClaimTypeMetadataRequest{
  billingId: string[];
}
export interface getClaimTypeMetadataResponse{
  metadata: claimTypeWOList[];
  executionTime: string;
  returnCode: number;
  returnMsg: string;
}
export interface serviceHistoryModal{
  claim: string,
  claimCode: string,
  custProblem: string,
  equipMake: string,
  equipModel: string,
  equipSerialNo: string,
  equipYear: string,
  technicalDiagnosis: string,
  technicianName: string,
  unitNo: string,
  workDone: string,
  workOrderDate: string,
  workOrderId: string,
  parts:string,
  invoiceAmountTotal: string,
  invoiceID: string,
  invoiceDate: string

}

export interface ShippingIdMetadataResponse
{
  billIds:string[],

 }

 export interface claimTypeListSearch{
   fromDate:string | null,
   toDate:string | null
 }
