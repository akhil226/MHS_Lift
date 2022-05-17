import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { Attachment } from '../interfaces/request.interface';
import { NOTIFICATION_MSG } from '../constants/notification.constant';

@Injectable({
  providedIn: 'any'
})
export class AttachmentService {

  constructor(
    private notification: NotificationService
  ) { }

  private getBase64fromInputFile(fileInfo: File): Promise<Attachment> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(fileInfo);
      reader.onload = () => {
        const base64Data = reader.result?.toString() || '';
        const fileExtension = fileInfo.name.split('.')?.pop()?.trim().toLowerCase() || '';
        if (base64Data.length) {
          resolve({
            fileData: base64Data.split(',')[1],
            fileDesc: '',
            fileName: fileInfo.name,
            fileNo: 0,
            fileType: fileExtension,
            requestNo: '',
            remove: 'Remove'
          });
        } else {
          reject(null);
        }
      };
      reader.onerror = () => {
        reject(null);
      };
    });
  }

  processAttchment(item: File): Promise<Attachment> | null {
    const fileExtension = item.name.split('.')?.pop()?.trim().toLowerCase();
    if (fileExtension === 'png' ||
      fileExtension === 'jpg' ||
      fileExtension === 'jpeg' ||
       fileExtension === 'pdf' ||
       fileExtension === 'doc' ||
      fileExtension === 'docx') {
      const fileSize = parseFloat((item.size / 1048576).toFixed(3));
      const expression = /[%^&*|~`"'{}:\/<>?#]/;
      const regex = new RegExp(expression);
      if (regex.test(item.name)) {
        this.notification.showNotification(NOTIFICATION_MSG.InvalidFileName);
        return null;
      }
      if (fileSize < 10) {
        return this.getBase64fromInputFile(item);
      } else {
        this.notification.showNotification(NOTIFICATION_MSG.InvalidFileSize);
        return null;
      }
    } else {
      this.notification.showNotification(NOTIFICATION_MSG.InvalidFileType);
      return null;
    }
  }
}
