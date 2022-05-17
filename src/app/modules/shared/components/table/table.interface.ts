/**
 * @field {string} title to be displayed in the Header
 * @field {string} field name to match the object property in row data
 */
export interface ColumnDefs extends ExpColumDef {
  /** default value is true */
  sortable?: boolean;
  type?: 'date' | '' ;
  sortKey?: string;
}

export interface TableSettings {
  expandable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  localSort?: boolean;
}

export interface ExpColumDef {
 /** title to be displayed in the Header */
 title: string;
 /** field name to match the object property in row data */
 field: string;
}
export interface TableSort {
  orderBy: string;
  order: 'asc' | 'desc';
}
