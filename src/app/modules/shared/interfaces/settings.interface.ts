export interface UpdateUserPrevAccessRequest {
    billingId: string[];
    userPreAccess: SettingsPreAccess[];
  }

export interface UpdateUserPrevAccessResponse {
    executionTime: string;
    returnCode: number;
    returnMsg: string;
  }
export interface SettingsPreAccess {
    menuId: string;
    status: string;
  }
