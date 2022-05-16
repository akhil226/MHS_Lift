export interface ServiceRequest {
    attachments: Attachment[];
    billTo: string;
    contactEmails: string;
    contactName: string;
    contactPhones: string;
    equipLocation: string;
    equipMake: string;
    equipModel: string;
    equipSrNo: string;
    equipUnitNo: string;
    needEmService: string;
    param1: string;
    platform: string;
    poNumber: string;
    requestDesc: string;
    requestType: string;
    requestforUserCode: string;
    serviceType: string;
    shipTo: string;
    truckDown: string;
    userName: string;
    userPhone: string;
    companyName: string;
}

export interface Attachment {
    fileData: string;
    fileDesc: string;
    fileName: string;
    fileNo: 0;
    fileType: string;
    requestNo: string;
    remove: 'Remove';
}

export interface ServiceRequestResponse {
    executionTime: string;
    requestNo: string;
    returnCode: 0;
    returnMsg: string;
}

export interface PMRequestModal {
    attachments: Attachment[];
    pmRequests: PMRequest[];
}
export interface PMRequest {
    billTo: string;
    contactEmails: string;
    contactName: string;
    contactPhones: string;
    equipLocation: string;
    equipMake: string;
    equipModel: string;
    equipSrNo: string;
    equipUnitNo: string;
    param1: string;
    poNumber: string;
    requestDesc: string;
    requestforUserCode: string;
    shipTo: string;
    userName: string;
    userPhone: string;
    platform: 'WEB';
    serviceType: '1';
    requestType: 'MHSPMR';
    userCode: string;
    userType: string;
    companyName: string;
}

export interface PMEquipModal {
    billTo: string;
    equipLocation: string;
    equipMake: string;
    equipModel: string;
    equipSrNo: string;
    equipUnitNo: string;
    shipTo: string;
    companyName: string;
    remove: string;
}
export interface EmergencyMetadata {
  keyField: string;
  valueField: string;
}
export interface EmergencyServiceMetada {
  metadata: EmergencyMetadata[];
  returnCode: number;
  returnMsg: string;
}
