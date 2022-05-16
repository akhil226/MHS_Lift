import { BillId } from './../shared/interfaces/billid.interface';

export interface UserPreAccess {
  adminMenuStatus: string;
  menuDesc: string;
  menuId: string;
  menuName: string;
  menuStatus: string;
  menuType: string;
  userMenuStatus: string;
}
export interface UserDetails {
  accessToken: string;
  email: string;
  executionTime: string;
  jobDesignation: string;
  mobileNo: string;
  refreshToken: string;
  resetPassword: string;
  returnCode: number;
  returnMsg: string;
  superUser: string;
  uiBVersion:string;
  userBillIds: BillId[];
  userCode: string;
  userFName: string;
  userLName: string;
  userPreAccess: UserPreAccess[];
  userType: string;
  woPdfPath: string;
}
export interface LoginData {
  param1: string;
  param2: string;
  platform: string;
  uiVersion:string;
}

export interface ResetPwdData {
  param1: string;
  param2: string;
  param3: string;
  userCode: string;
  userType: string;
}

export interface ResetPwdResponse {
  executionTime: string;
  returnCode: number;
  returnMsg: string;
}
export interface RefreshTokenReq {
  refreshToken: string;
  userCode: string;
  userType: string;
}
export interface RefreshToken {
  accessToken: string;
  refreshToken: string;
  returnCode: number;
  returnMsg: string;
}
