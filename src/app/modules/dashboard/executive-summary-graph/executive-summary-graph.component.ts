import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional, ViewChild, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as c3 from 'c3';
import * as d3 from 'd3';
import { Observable, Subject } from 'rxjs';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { NOTIFICATION_MSG } from '../../shared/constants/notification.constant';
import { ExecutiveSummaryGraphModel, ExecutiveSummaryRequest } from '../../shared/interfaces/executiveSummary.interface';
import { BillingIdService } from '../../shared/services/billing-id.service';
import { ExecutiveSummaryService } from '../../shared/services/executive-summary.service';
import { NotificationService } from '../../shared/services/notification.service';
import { UtlilityService } from '../../shared/services/utlility.service';
import { ExecutiveSummaryResponse } from './../../shared/interfaces/executiveSummary.interface';

type ExecutiveSummaryMetadata = { isNotDashboard: boolean, location: string[] };
@Component({
  selector: 'app-executive-summary-graph',
  templateUrl: './executive-summary-graph.component.html',
  styleUrls: ['./executive-summary-graph.component.scss']
})
export class ExecutiveSummaryGraphComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('executiveSummary') graphDiv: ElementRef<HTMLElement> | undefined;
  @ViewChildren('datePicker') datePicker: any;
  @Input() location$: Observable<{ location: string[] }> | undefined = undefined;
  billingId: string[] = [];
  currentYearSummary: number[] = [];
  previousYearSummary: number[] = [];
  startDate = '';
  endDate = '';
  currentYearExecutiveSummaryGraphModel: ExecutiveSummaryGraphModel = {
    executiveSummaryModalList: [],
    xAxisValue: [],
    currentYearSummary: [],
    previousYearSummary: []
  };
  previousYearExecutiveSummaryGraphModel: ExecutiveSummaryGraphModel = {
    executiveSummaryModalList: [],
    xAxisValue: [],
    currentYearSummary: [],
    previousYearSummary: []
  };
  maxDate = new Date();
  catogory: string[] = [];
  private unSubscribe$ = new Subject();
  executiveSummaryRequest: ExecutiveSummaryRequest = {
    billingId: [],
    location: [],
    curYearFromDate: new Date(this.utlilityService.addOrSubtractYear(-1)).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    curYearToDate: new Date(this.utlilityService.addOrSubtractYear(0)).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    prevYearFromDate: new Date(this.utlilityService.addOrSubtractYear(-2)).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    prevYearToDate: new Date(this.utlilityService.addOrSubtractYear(-1)).
      toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  };
  loader = false;
  executiveSummaryResponseTemp: ExecutiveSummaryResponse | undefined;
  graphColumn: any[] = [];
  graphColor: any | undefined;
  toolTip: any;
  constructor(
    private billingIdService: BillingIdService,
    public executiveSummaryService: ExecutiveSummaryService,
    private utlilityService: UtlilityService,
    private notification: NotificationService,
    @Optional() public dialogRef: MatDialogRef<ExecutiveSummaryGraphComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ExecutiveSummaryMetadata

  ) { }

  ngOnInit(): void {
    this.currentYearExecutiveSummaryGraphModel = this.utlilityService.getAllMonthsbetweenDates(this.executiveSummaryRequest.curYearFromDate,
      this.executiveSummaryRequest?.curYearToDate, false);
    if (this.executiveSummaryRequest.prevYearFromDate !== null) {
      this.previousYearExecutiveSummaryGraphModel = this.utlilityService.getAllMonthsbetweenDates(
        this.executiveSummaryRequest?.prevYearFromDate, this.executiveSummaryRequest?.prevYearToDate, false);
    }
  }
  ngAfterViewInit(): void {
    if (!this.data?.isNotDashboard) {
      this.location$?.pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(({ location }) => this.getBillingId(location));
    } else {
      this.executiveSummaryResponseTemp = this.executiveSummaryService.executiveSummary;
      this.generateLineChart();
    }
  }
  private _isInvalidDateIfAny(): boolean {
    return this.datePicker.toArray().some(({ errors }: any) => errors);
  }
  onDateSelected(): void {
    if (this._isInvalidDateIfAny()) {
      this.notification.showNotification(NOTIFICATION_MSG.inValidDateFormat);
    } else if (this.startDate && this.endDate) {
      if (this.utlilityService.checkFromGreaterThanToDates(new Date(this.startDate), new Date(this.endDate))) {
        this.notification.showNotification(NOTIFICATION_MSG.dateValidation);
      } else {
        const startDate = new Date(this.startDate).
          toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const endDate = new Date(this.endDate).
          toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const summaryModal = this.utlilityService.getAllMonthsbetweenDates(startDate, endDate, false);
        if (summaryModal.xAxisValue.length < 14) {
          this.executiveSummaryRequest.curYearFromDate = startDate;
          this.executiveSummaryRequest.curYearToDate = endDate;
          this.executiveSummaryRequest.prevYearFromDate = new Date(this.utlilityService.addOrSubtractYear(-1, new Date(this.startDate))).
            toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          this.executiveSummaryRequest.prevYearToDate = new Date(this.utlilityService.addOrSubtractYear(-1, new Date(this.endDate))).
            toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          this.currentYearExecutiveSummaryGraphModel = this.utlilityService.getAllMonthsbetweenDates(
            this.executiveSummaryRequest.curYearFromDate, this.executiveSummaryRequest?.curYearToDate, false);
          this.previousYearExecutiveSummaryGraphModel = this.utlilityService.getAllMonthsbetweenDates(
            this.executiveSummaryRequest?.prevYearFromDate, this.executiveSummaryRequest?.prevYearToDate, false);
          this.getBillingId(this.data.location);
        } else {
          this.notification.showNotification(NOTIFICATION_MSG.date2Validation);
        }
      }
    }

  }
  private generateLineChart(): void {
    for (let i = 0; i < this.currentYearExecutiveSummaryGraphModel.executiveSummaryModalList.length; i++) {
      this.executiveSummaryService.executiveSummary?.executiveSummaryCurYearlist.forEach(data => {
        if (+data.month === this.currentYearExecutiveSummaryGraphModel.executiveSummaryModalList[i].month &&
          +data.year === this.currentYearExecutiveSummaryGraphModel.executiveSummaryModalList[i].year) {
          this.currentYearExecutiveSummaryGraphModel.currentYearSummary[i] = +data?.amount;
        }
      });
    }

    for (let i = 0; i < this.previousYearExecutiveSummaryGraphModel.executiveSummaryModalList.length; i++) {
      this.executiveSummaryService.executiveSummary?.executiveSummaryPrevYearlist.forEach(data => {
        if (+data.month === this.previousYearExecutiveSummaryGraphModel.executiveSummaryModalList[i].month &&
          +data.year === this.previousYearExecutiveSummaryGraphModel.executiveSummaryModalList[i].year) {
          this.previousYearExecutiveSummaryGraphModel.previousYearSummary[i] = +data.amount;
        }
      });
    }
    this.previousYearSummary = [];
    this.currentYearSummary = [];
    this.graphColumn = [];
    this.graphColor = {};

    this.currentYearSummary = this.currentYearExecutiveSummaryGraphModel.currentYearSummary;
    this.graphColumn.push(['Current Year', ...this.currentYearSummary]);
    this.graphColor = { 'Current Year': '#912728' };

    this.previousYearSummary = this.previousYearExecutiveSummaryGraphModel.previousYearSummary;
    this.graphColumn.push(['Previous Year', ...this.previousYearSummary]);
    this.graphColor = {
      ...this.graphColor, 'Previous Year': '#2e97fd'
    };


    this.catogory = this.currentYearExecutiveSummaryGraphModel.xAxisValue;

    setTimeout(() => {
      c3.generate({
        bindto: this.graphDiv?.nativeElement,
        data: {
          columns: this.graphColumn,
          colors: this.graphColor
        },
        axis: {
          x: {
            tick: {
              centered: true
            },
            type: 'category',
            categories: this.catogory
          },
          y: {
            min: 0, padding: { bottom: 0 }, tick: {
              format: d3.format('$')
            }
          }
        },
        grid: { x: { show: true } },
        point: { r: 0, focus: { expand: { r: 5 } } },
        tooltip: {
          contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
            // if (this.executiveSummaryService.executiveSummary?.executiveSummaryPrevYearlist.length) {
            return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>
              <div class='exc-summary-tooltip tooltip-blue'>$ ${d?.[1]?.value}</div>`;
            // } else {
            //   return `<div class='exc-summary-tooltip tooltip-red'>$ ${d?.[0]?.value}</div>`;
            // }

          },
        },
      });
    }, 1000);
  }

  getBillingId(location: string[]): void {
    this.billingIdService.getBillingId().pipe(
      filter(billingId => !!billingId?.length),
      takeUntil(this.unSubscribe$)
    ).subscribe(billingId => {
      this.billingId = billingId;
      this.getExecutiveSummaryDetails(location);
    });

  }

  public getExecutiveSummaryDetails(location: string[]): void {
    setTimeout(() => {
      this.loader = true;
    });
    this.executiveSummaryRequest.billingId = this.billingId;
    this.executiveSummaryRequest.location = location;
    this.executiveSummaryService.getExecutiveSummary(this.executiveSummaryRequest).pipe(
      finalize(() => this.loader = false),
      filter(
        ({ returnCode }) => returnCode === 0)
    ).subscribe(res => {
      if (!this.executiveSummaryResponseTemp) {
        this.executiveSummaryResponseTemp = res;
      }
      this.executiveSummaryService.executiveSummary = res;
      this.generateLineChart();

    });
  }
  ngOnDestroy(): void {
    this.unSubscribe$.next(true);
    this.unSubscribe$.complete();
  }
  onDismiss(data: boolean): void {
    this.executiveSummaryService.executiveSummary = this.executiveSummaryResponseTemp;
    this.dialogRef.close(data);
  }
  closeDialog(): void {
    this.executiveSummaryService.executiveSummary = this.executiveSummaryResponseTemp;
    this.dialogRef.close();
  }
}
