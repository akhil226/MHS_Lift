import { Injectable } from '@angular/core';
import { ExecutiveSummarylist, ExecutiveSummaryGraphModel, ExecutiveSummaryModal } from '../interfaces/executiveSummary.interface';
import { MonthlyServiceComparisonList,MonthlyServiceComparisonGraphModel,MonthlyServiceComparisonModal } from '../interfaces/monthly-service.interface';
@Injectable({
  providedIn: 'any'
})
export class UtlilityService {

  constructor() { }
  /**
   * Utility to check if from date is greater than two data
   * Use this only with dates having same time
   * @param from from date
   * @param to date
   * @returns false if from date is greater than to else returns true
   */
  checkFromGreaterThanToDates(from: Date | string, to: Date | string): boolean {
    const toDate = new Date(to);
    const fromDate = new Date(from);
    return fromDate > toDate;
  }
  addOrSubtractDate(startDate: Date, days: number): Date {
    const endDate = startDate;
    endDate.setDate(endDate.getDate() + days);
    return endDate;
  }
  addOrSubtractYear(additionOfYears: number, fromdate = new Date()): Date {
    const date = fromdate;
    date.setFullYear(date.getFullYear() + additionOfYears); // For subtract use minus (-)
    return date;
  }

  getAllMonthsbetweenDates(startDate: any, endDate: any, isTwoLines: boolean): ExecutiveSummaryGraphModel {
    const start = startDate.split('/');
    const end = endDate.split('/');
    const startYear = parseInt(start[2], 10);
    const endYear = parseInt(end[2], 10);
    const executiveSummaryModalList: ExecutiveSummaryModal[] = [];
    const xAxisValue: string[] = [];
    const currentYearSummary: number[] = [];
    const previousYearSummary: number[] = [];

    for (let i = startYear; i <= endYear; i++) {
      const endMonth = i !== endYear ? 11 : parseInt(end[0], 10) - 1;
      const startMon = i === startYear ? parseInt(start[0], 10) - 1 : 0;
      for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
        const month = j + 1;
        const displayMonth = month < 10 ? month : month;
        executiveSummaryModalList.push({
          amount: 0,
          month: displayMonth,
          year: i,
        });
        // dates.push([i, displayMonth, '01'].join('-'));
        xAxisValue.push(isTwoLines ? `${Month[displayMonth - 1]} ` + i : Month[displayMonth - 1]);
        currentYearSummary.push(0);
        previousYearSummary.push(0);
      }
    }
    return {
      executiveSummaryModalList,
      xAxisValue,
      currentYearSummary,
      previousYearSummary
    };
  }
}

enum Month {
  Jan,
  Feb,
  Mar,
  Apr,
  May,
  Jun,
  Jul,
  Aug,
  Sep,
  Oct,
  Nov,
  Dec
}
