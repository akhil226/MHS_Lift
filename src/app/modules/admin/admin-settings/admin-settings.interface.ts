import { SettingsPreAccess } from './../../shared/interfaces/settings.interface';
import { UserPreAccess } from './../../login/login.interface';

export interface AllAdminSetting extends UserPreAccess {
  defaultValue: string;
}
export interface AllAdminSettings {
  adminSettings: AllAdminSetting[];
  executionTime: string;
  returnCode: number;
  returnMsg: string;
}
export interface AdminSettingsUpdate {
  adminPreAccess: SettingsPreAccess[];
}
