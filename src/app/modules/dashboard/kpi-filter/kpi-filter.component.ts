import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NOTIFICATION_MSG } from 'src/app/modules/shared/constants/notification.constant';
import { Dropdown } from './../../shared/components/multiselect/dropdown.interface';
import { WOSTATUS_DATA } from './../../shared/constants/drodown.constants';
import { NotificationService } from './../../shared/services/notification.service';
import { UtlilityService } from './../../shared/services/utlility.service';

type KpiFilter = { isPMWO: string | number | null, fromDate: string | Date |  null, toDate: string | Date | null };
@Component({
  selector: 'app-kpi-filter',
  templateUrl: './kpi-filter.component.html',
  styleUrls: ['./kpi-filter.component.scss']
})
export class KpiFilterComponent implements OnInit {
  woDdl: Dropdown = {
    multi: false,
    placeholder: 'Select WO',
    data: WOSTATUS_DATA
  };
  maxDate = new Date();
  constructor(
    public dialogRef: MatDialogRef<KpiFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public kpiFilterData: KpiFilter,
    private utility: UtlilityService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
  }
  onDismiss(data: KpiFilter | null): void {
    this.dialogRef.close(data);
  }
  private _validFilter(): boolean {
    // if (!this.KpiFilterData.fromDate && !this.KpiFilterData.toDate && !this.KpiFilterData.isPMWO?.toString()) {
    //   this.notification.showNotification(NOTIFICATION_MSG.filterValidation);
    //   return false;
    // }
    if (!this.kpiFilterData.isPMWO?.toString()) {
      this.notification.showNotification(NOTIFICATION_MSG.WORequired);
      return false;
    }
    if (this.kpiFilterData.fromDate && this.kpiFilterData.toDate) {
      if (this.utility.checkFromGreaterThanToDates(this.kpiFilterData.fromDate as string, this.kpiFilterData.toDate as string)) {
        this.notification.showNotification(NOTIFICATION_MSG.dateValidation);
        return false;
      }
    }
    return true;
  }
  filterKpi(): void {
    if (this._validFilter()) {
      const fromDate = this.kpiFilterData.fromDate
        ? new Date(this.kpiFilterData.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : null;
      const toDate = this.kpiFilterData.toDate
        ? new Date(this.kpiFilterData.toDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : null;
      const isPMWO = this.kpiFilterData.isPMWO ?? null;
      const data = { isPMWO: isPMWO?.toString() || null, fromDate, toDate };
      this.onDismiss(data);
    }
  }
  resetFilter(): void {
    const today = new Date();
    const sevenDaysBeforeToday = this.utility.addOrSubtractDate(new Date(), -29);
    this.kpiFilterData.fromDate = sevenDaysBeforeToday;
    this.kpiFilterData.toDate = today;
    this.kpiFilterData.isPMWO = 0;
  }
}
