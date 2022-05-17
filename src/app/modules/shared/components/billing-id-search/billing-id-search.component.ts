import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { BillId } from '../../interfaces/billid.interface';
import { BillingIdSearchService } from './billing-id-search.service';

@Component({
  selector: 'app-billing-id-search',
  templateUrl: './billing-id-search.component.html',
  styleUrls: ['./billing-id-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingIdSearchComponent implements OnInit {
  input = new FormControl();
  searchResult$: Observable<BillId[]> = of([]);
  @Output() billingIdChange = new EventEmitter<BillId>();
  constructor(
    private billingIds: BillingIdSearchService
  ) { }

  ngOnInit(): void {
    this._getBillingDetails();
  }
  private _getBillingDetails(): void {
    this.searchResult$ = this.input.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(searchText => searchText?.length > 2),
      switchMap(searchText => this.billingIds.searchBilllingId(searchText))
    );
  }
  onBillingIdChange(event: any, bill: BillId): void {
    if (event.source._selected) {
      this.input.setValue('');
      this.billingIdChange.emit(bill);
      
    }
  }
}
