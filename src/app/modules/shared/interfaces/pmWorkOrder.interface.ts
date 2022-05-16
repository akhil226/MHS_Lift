
export interface PMWorkOrderListRequest extends PMWorkOrderListSearch {
    billingId: string[];
    limitList: number;
    offsetList: number;
    orderBy: string;
  }
export interface PMWorkOrderListSearch {
    equipMfr: string|null;
    equipProdId: string|null;
    equipSRNO: string|null;
    equipUnitNo: string|null;
    location: string[];
  }
export interface PMWorkOrderListResponse {
    executionTime: string;
    pmwolist: PMWorkOrder[];
    returnCode: number;
    returnMsg: string;
    totalRows: string;
  }

export interface PMWorkOrder {
    dueDate: string;
    equipmentMfr: string;
    equipmentModel: string;
    equipmentSerialNo: string;
    equipmentShipto: string;
    equipmentUnitNo: string;
    equipmentlocation: string;
    lastMeterRead: string;
    lastPM: string;
    pmHourMeter: string;
    wopdfPath: string;
  }
