import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { finalize } from 'rxjs/operators';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { LoaderService } from './loader.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'any'
})
export class FileDownloadService<T> {

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private loader: LoaderService
  ) { }
  downloadFile(url: string, data: T): void {
    this.loader.show();
    this.http.post(url, data, { responseType: 'blob', observe: 'response' }).pipe(
      finalize(() => this.loader.hide())
    ).subscribe(response => {
      const blobFileData = response.body || '';
      const fileName = response.headers.get('content-disposition')?.split('filename=')?.[1] || `File${new Date().getTime()}.xls`;
      saveAs(blobFileData, fileName);
      this.notification.showNotification(NOTIFICATION_MSG.fileDownloadMsg);
    });
  }
}

