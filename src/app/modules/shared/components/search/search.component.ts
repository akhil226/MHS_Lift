import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges,
  OnInit, Output, SimpleChanges, ViewChildren
} from '@angular/core';
import { NOTIFICATION_MSG } from '../../constants/notification.constant';
import { NotificationService } from '../../services/notification.service';
import { SearchInput } from './search.interface';

@Component({
  selector: 'app-search[data]',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnChanges {
  @Input() data: Array<SearchInput> = [];
  @Output() search = new EventEmitter<any>();
  @Output() clear = new EventEmitter<any>();
  @ViewChildren('datePicker') datePicker: any;
  searchModel: any;
  maxDate = new Date();
  constructor(
    public notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (propName === 'data') {
          const sum = this.data.reduce((accumilator, { col }) => col + accumilator, 0);
          if (sum > 12) {
            throw new Error('Sum of columns should be 12');
          } else {
            this._createSearchModel();
          }
        }
      }
    }
  }
  private _createSearchModel(): void {
    const model = this.data.map(({ field, inputType, value, metadata }) => (
      inputType === 'Dropdown' && metadata?.multi ? { [field]: value || [] } : { [field]: value ?? '' }
    ));
    this.searchModel = Object.assign({}, ...model);
  }
  private _isInvalidDateIfAny(): boolean {
    return this.datePicker.toArray().some(({ errors }: any) => errors);
  }
  onSearch(): void {
    if (this._isInvalidDateIfAny()) {
      this.notificationService.showNotification(NOTIFICATION_MSG.inValidDateFormat);
    } else {
      this.search.emit(this.searchModel);
    }
  }
  clearForm(): void {
    // this._createSearchModel();
    const model = this.data.map(({ field, inputType, value, metadata }) => (
      inputType === 'Dropdown' && metadata?.multi ? { [field]: [] } : { [field]: '' }
    ));
    this.searchModel = Object.assign({}, ...model);
    this.clear.emit(this.searchModel);
  }
}
