import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  showNotification(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 4000
    });
  }

  emergencyServiceNotification(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, { verticalPosition: 'top' });
  }
}
