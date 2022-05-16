import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EquipmentServiceHistoryModel } from '../../shared/interfaces/equipment.interface';

@Component({
  selector: 'app-service-history',
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-history.component.scss']
})
export class ServiceHistoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ServiceHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EquipmentServiceHistoryModel
  ) { }

  ngOnInit(): void {
  }
  onDismiss(data: boolean): void {
    this.dialogRef.close(data);
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
