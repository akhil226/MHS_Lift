import { BillId, ShippingDetail as ShipTo } from './../../../shared/interfaces/billid.interface';

export interface UserPreAccess {
  menuId: string;
  status: string;
}
export interface AddCustomer {
  androidId: string;
  createdBy: string;
  iosId: string;
  jobDesignation: string;
  mobileNo: number;
  param1: string;
  param2: string;
  superUser: string;
  userBills: BillId[];
  userFname: string;
  userLname: string;
  userPreAccess: UserPreAccess[];
  createEdituserType: string;
  createEdituserCode: string;
  newEmail: string;
  oldEmail: string;
}
export interface AdminSetting {
  defaultValue: string;
  menuDesc: string;
  menuId: string;
  menuName: string;
  menuStatus: string;
  menuType: string;
  userMenuStatus: string;
}
export interface AdminSettingResponse {
  adminSettings: AdminSetting[];
  executionTime: string;
  returnCode: number;
  returnMsg: string;
}
export interface AddorEditUserResponse {
  executionTime: string;
  returnCode: number;
  returnMsg: string;
  userCode: string;
}
export interface EditUserPreAccess extends AdminSetting {
  adminMenuStatus: string;
}
export interface EditUserDetails {
  email: string;
  executionTime: string;
  jobDesignation: string;
  mobileNo: string;
  resetPassword: string;
  returnCode: number;
  returnMsg: string;
  superUser: string;
  userBillIds: EditUserBill[];
  userCode: string;
  userFName: string;
  userLName: string;
  userPreAccess: EditUserPreAccess[];
  userType: string;
}
export interface EditUserBill {
  billToAddress: string;
  unselectDetails: ShipTo[];
  billTo: string;
  billToName: string;
  selectDetails: ShipTo[];
}

