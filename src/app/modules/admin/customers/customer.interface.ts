export interface CustomerListReq extends UserSearch {
  limitList: number;
  listUsertype: string;
  offsetList: number;
  orderBy: string;
}
export interface UserSearch {
  searchUserJobDesign: string | null;
  searchUserEmail: string | null;
  searchUserName: string | null;
  searchUserStatus: string | null;
  searchBillTo : string | null;
}
export interface UserList {
  listUserCode: string;
  listUserContactNumber: string;
  listUserEmail: string;
  listUserFullName: string;
  listUserJobDesign: string;
  listUserStatus: string;
  listUserType: string;
  lastLogin: string;
  lastReportSearch:  string;
  lastRequest:  string;
  billToName:string;
  
}
export interface CustomerListing {
  executionTime: string;
  returnCode: number;
  returnMsg: string;
  totalRows: string;
  userLists: UserList[];
}
export interface UserStatusUpdateReq {
  changeStatusTo: string;
  userCodeForStatus: string;
}
export interface ResetPasswordReq {
  param1: string;
  param2: string;
  userCodeForPassword: string;
  userFNameForPassword: string;
  userLNameForPassword: string;
}
