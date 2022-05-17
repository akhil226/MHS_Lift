import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const AESPARAM = '6w9z$C&F)J@NcRfU';
@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private secureKey: CryptoJS.lib.WordArray;
  private secureIV: CryptoJS.lib.WordArray;
  private mode: any;
  constructor() {
    this.secureKey = CryptoJS.enc.Utf8.parse(AESPARAM);
    this.secureIV = CryptoJS.enc.Utf8.parse(AESPARAM);
    this.mode = {
      keySize: 128 / 8,
      iv: this.secureIV,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    };
  }
  /**
   * Method to encrypt the values use AES
   * @param value value to be encrypted
   */
  getEncryptedValue(value: string): string {
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), this.secureKey, this.mode);
    return encrypted.toString();
  }
  /**
   * Method to get the Decrypted values uses AES
   * @param value value to be decrypted
   */
  getDecryptedValue(value: string): string {
    const decrypted = CryptoJS.AES.decrypt(value, this.secureKey, this.mode);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
