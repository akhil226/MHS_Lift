import { SortPipe } from './../../pipes/sort.pipe';
import { Pagination, PagionationOffset } from './pagination/pagination.interface';
import { TemplateHeaderDirective } from './template-header.directive';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  EventEmitter
} from '@angular/core';
import { ColumnDefs, TableSettings, ExpColumDef, TableSort } from './table.interface';

@Component({
  selector: 'app-table[columnDef][rowData]',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [SortPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, OnChanges {
  @Input() columnDef: Array<ColumnDefs> = [];
  @Input() settings: TableSettings = { expandable: false, selectable: false, pagination: true };
  @Input() rowData: Array<any> = [];
  @Input() expColumnDef: Array<ExpColumDef> = [];
  @Input() pagination: Pagination = { page: 12, totalCount: 120 };
  @Output() changePage = new EventEmitter<PagionationOffset>();
  @Output() changeRowSelection = new EventEmitter<any[]>();
  @Output() changeSort = new EventEmitter<TableSort>();
  orderBy = '';
  order: 'asc' | 'desc' | '' = '';
  type: 'date' | '' = '';
  selectAllRows = false;
  selectModel: Array<boolean> = [];
  @ContentChildren(forwardRef(() => TemplateHeaderDirective), { read: TemplateHeaderDirective })
  templates: QueryList<TemplateHeaderDirective> | undefined;
  constructor(
    private sortPipe: SortPipe
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (propName === 'rowData') {
          this.selectAllRows = false;
          this.rowData = this.rowData?.map(data => ({ ...data, expanded: false, checked: false })) || [];
          if (this.settings.selectable) {
            const rowDataLength = this.rowData?.length || 0;
            this.selectModel.length = rowDataLength;
            this.selectModel.fill(false);
          }
        }
      }
    }
  }
  expandOrCollapse(index: number): void {
    this.rowData[index].expanded = !this.rowData[index].expanded;
    console.log(this.rowData,"from tanle .......");

  }
  sort(orderBy: string, order: 'asc' | 'desc', type: 'date' | ''): void {
    this.orderBy = orderBy;
    this.order = order;
    this.type = type;
    if (this.settings.localSort) {
      this.sortPipe.transform(this.rowData, orderBy, order, type);
    } else {
      this.changeSort.emit({ order, orderBy });
    }
  }
  onPageChange(pagination: PagionationOffset): void {
    this.selectAllRows = false;
    this.changePage.emit(pagination);
  }
  onSelectAllRowsChange(): void {
    if (this.selectAllRows) {
      //  this.rowData = this.rowData?.map(data => ({ ...data, checked: true }));
      this.selectModel = this.selectModel.map(_ => true);
      this.changeRowSelection.emit(this.rowData);
    } else {
      // this.rowData = this.rowData?.map(data => ({ ...data, checked: false }));
      this.selectModel = this.selectModel.map(_ => false);
      this.changeRowSelection.emit([]);
    }
  }
  onRowCheckedOrUnchecked(selected: boolean): void {
    if (!selected) {
      this.selectAllRows = false;
    } else {
      //  const allRowsChecked = this.rowData.every(({ checked }) => checked);
      const allRowsChecked = this.selectModel.every((checked) => checked);
      if (allRowsChecked) {
        this.selectAllRows = true;
      }
    }
    //  const selectedRows = this.rowData.filter(({ checked }) => checked);
    const selectedRows = this.rowData.map((data, index) =>
      ({ ...data, checked: this.selectModel[index] }))
      .filter(({ checked }) => checked);
    this.changeRowSelection.emit(selectedRows);
  }
}
