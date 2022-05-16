import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { serviceHistoryModal } from '../../shared/interfaces/claim-type.interface';

@Component({
  selector: 'app-servicehistory',
  templateUrl: './servicehistory.component.html',
  styleUrls: ['./servicehistory.component.scss']
})
export class ServicehistoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ServicehistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: serviceHistoryModal
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
