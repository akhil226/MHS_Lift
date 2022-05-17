import { DropDownData } from '../components/multiselect/dropdown.interface';

export interface EquipmentListMetadataRequest {
  billingId: string[];
}

export interface EquipmentListMetadataResponse {
  equipmentList: Equipment[];
  executionTime: string;
  returnCode: number;
  returnMsg: string;
}

export interface Equipment {
  concatSrUnit: string;
  equipSerialNo: string;
  equipmentNo: string;
  unitNo: string;
  billTo: string;
  company: string;
  location: string;
  shipTo: string;
  equipMake: string;
  equipModel: string;
}

export interface EquipmentListMetadata {
  EquipList: DropDownData[];
}

export interface EquipmentDetailsRequest {
  billingId: string[];
  equipSerialNo: string;
}
export interface EquipmentDetailsResponse {
  equipmentList: EquipmentList[];
  equipmentServiceHistory: EquipmentServiceHistoryModel[];
  equipmentopenJobs: EquipmentOpenJobsModel[];
  executionTime: string;
  returnCode: number;
  returnMsg: string;
}

export interface EquipmentList {
  billTo: string;
  equipCMHR: string;
  equipMake: string;
  equipModel: string;
  equipSerialNo: string;
  equipStatus: string;
  equipYear: string;
  equipmentNo: string;
  location: string;
  serviceAgmt: string;
  shipTo: string;
  unitNo: string;
}

export interface EquipmentServiceHistoryModel {
  custProblem: string;
  parts: EquipmentPartsModel[];
  partsWithHiExtPrice: string;
  status: string;
  statusCode: string;
  technicalDiagnosis: string;
  technicianName: string;
  workDone: string;
  workOrderDate: string;
  workOrderId: string;
  more: string;
  wopdfPath: string;
}

export interface EquipmentPartsModel {
  partsExtPrice: string;
  partsName: string;
  quantity: string;
  workOrderId: string;
}

export interface EquipmentOpenJobsModel {
  createdDate: string;
  equipSerialNo: string;
  unitNo: string;
  updatedOn: string;
  workOrderDesc: string;
  workOrderId: string;
  workOrderStatus: string;
  workOrderStatusCode: string;
  workOrderType: string;
  wopdfPath: string;
}
export interface EquipmentListItmes {
  equipmentList: EquipmentList[];
  executionTime: string;
  returnCode: number;
  returnMsg: string;
  totalRows: string;
}
export interface EquipmentListReq extends EquipmentListSearch {
  billingId: string[];
  limitList: number;
  offsetList: number;
  orderBy: string;
}
export interface EquipmentListSearch {
  equipMake: string | null;
  equipModel: string | null;
  equipSerialNo: string | null;
  equipYear: string | null;
  location: string[];
}
export interface LocationList {
  billTo: string;
  company: string;
  location: string;
  shipTo: string;
}
export interface LocationMetaData {
  executionTime: string;
  locationList: LocationList[];
  returnCode: number;
  returnMsg: string;
}
