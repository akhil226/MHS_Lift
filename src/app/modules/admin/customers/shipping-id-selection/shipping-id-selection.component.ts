import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BillId, ShippingDetail } from './../../../shared/interfaces/billid.interface';

@Component({
  selector: 'app-shipping-id-selection',
  templateUrl: './shipping-id-selection.component.html',
  styleUrls: ['./shipping-id-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShippingIdSelectionComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ShippingIdSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public billingDetail: BillId
  ) { }

  ngOnInit(): void { }

  onDismiss(value: boolean): void {
    const data = value ? this.billingDetail : null;
    this.dialogRef.close(data);
  }
}
