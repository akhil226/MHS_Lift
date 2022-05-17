import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(rowData: Array<any>, orderBy: string, order: 'asc' | 'desc' | '', type: 'date' | ''): Array<any> {
    if (!rowData || !orderBy) {
      return rowData || [];
    }
    if (type !== 'date') {
      return this._alphaNumericSort(rowData, orderBy, order);
    }
    return this._dateSort(rowData, orderBy, order);
  }
  private _alphaNumericSort(rowData: Array<any>, orderBy: string, order: 'asc' | 'desc' | ''): Array<any> {
    const updatedRow = rowData.sort((a, b) =>
      new Intl.Collator('en', { numeric: true, sensitivity: 'accent' }).compare(a[orderBy], b[orderBy])
    );
    if (order === 'asc') {
      return updatedRow;
    }
    return updatedRow.reverse();
  }
  private _dateSort(rowData: Array<any>, orderBy: string, order: 'asc' | 'desc' | ''): Array<any> {
    const updatedRow = rowData.sort((a, b) => {
      const secondDate = new Date(b[orderBy]).valueOf();
      const firstDate = new Date(a[orderBy]).valueOf();
      return secondDate - firstDate;
    });
    if (order === 'desc') {
      return updatedRow;
    }
    return updatedRow.reverse();
  }
}
