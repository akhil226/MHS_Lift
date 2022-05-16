export interface Dropdown {
  multi: boolean;
  placeholder: string;
  data: Array<DropDownData>;
  searchPlaceholderText?: string;
  allowSearchFilter?: boolean;
}
export interface DropDownData {
  key: string | number;
  value: string;
}
