import { Dropdown } from 'src/app/modules/shared/components/multiselect/dropdown.interface';
type Col = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SearchInput = {
  col: Col;
  inputType: 'Text' | 'Date' | 'Dropdown' | 'Number';
  placeHolder: string;
  field: string;
  value?: string | number | Date | number[] | string[];
  metadata?: Dropdown
};

