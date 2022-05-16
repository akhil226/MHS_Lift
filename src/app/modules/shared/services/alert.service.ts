import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AlertComponent } from './../components/alert/alert.component';
import { Alert } from './../components/alert/alert.interface';
import { ALERT } from './../constants/alert.constant';

@Injectable({
  providedIn: 'any'
})
export class AlertService {

  constructor(public dialog: MatDialog) { }

  show({ content, title }: Alert, width = '250px'): Observable<boolean> {
    const dialogRef = this.dialog.open(AlertComponent, {
      width,
      data: { title, content }
    });
    return dialogRef.afterClosed();
  }
  showDiscard(): Observable<boolean> {
    const title = ALERT.discardTitle;
    const content = ALERT.discardMsg;
    return this.show({ content, title }, '300px');
  }
}
