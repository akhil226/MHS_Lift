import { ColumnDefs } from 'src/app/modules/shared/components/table/table.interface';
export const DASHBOARD_WO_COLUMNS: ColumnDefs[] = [
  { title: 'WO #', field: 'woID', sortable: true, sortKey: 'two.WORK_ORDER_ID' },
  { title: 'SERIAL #', field: 'equipmentSrNo', sortable: true, sortKey: 'med.EQUIPMENT_SRNO' },
  { title: 'UNIT #', field: 'unitNo', sortable: true, sortKey: 'med.EQUIPMENT_NAME' },
  { title: 'WO TYPE', field: 'woType', sortable: true, sortKey: 'two.WORK_ORDER_TYPE' },
  { title: 'WO DESCRIPTION', field: 'woDescription', sortable: false },
  { title: 'CREATED DATE', field: 'createdDate', sortable: true, type: 'date', sortKey: 'two.SERVICE_REQUEST_DATE' },
  { title: 'PARTS ETA', field: 'partsETA', sortable: true, sortKey: 'two.PARTS_ETA' },
  { title: 'WO STATUS', field: 'status', sortable: true, sortKey: 'two.STATUS_CODE' },
  { title: 'LAST STATUS CHANGE', field: 'lastStatusChange', sortable: true, type: 'date', sortKey: 'two.UPDATED_ON' }
];
export const DASHBOARD_PM_COLUMNS = [
  { title: 'SERIAL #', field: 'equipmentSerialNo', sortable: true },
  { title: 'UNIT #', field: 'equipmentUnitNo', sortable: true },
  { title: 'LAST PM', field: 'lastPM', sortable: true },
  { title: 'DUE DATE', field: 'dueDate', sortable: true, type: 'date' },
];
export const DASHBOARD_PM_EXP_COLUMNS = [
  { title: 'LAST PM DATE', field: 'lastPmDate' },
  { title: 'MODEL', field: 'equipmentModel' },
  { title: 'MFR', field: 'equipmentMfr' },
  { title: 'ADDRESS', field: 'equipmentlocation' },
  { title: 'SHIP TO', field: 'equipmentShipto' },
  { title: 'PM HOUR METER', field: 'pmHourMeter' }
];
export const DASHBOARD_INVOICE_COLUMNS = [
  { title: 'INVOICE #', field: 'invoiceNumber', sortable: true },
  { title: 'AMOUNT', field: 'invoiceTotAmt', sortable: true },
  { title: 'SERIAL #', field: 'equipSerialNo', sortable: true },
  { title: 'DATE', field: 'invoiceDate', sortable: true, type: 'date' },
  { title: 'STATUS', field: 'invoicePaidStatus', sortable: true }
];
export const DASHBOARD_INVOICE_EXP_COLUMNS = [
  { title: 'LOCATION', field: 'equipLocation' },
  { title: 'WO', field: 'workOrderId' },
  { title: 'UNIT #', field: 'unitNumber' },
  { title: 'MAKE', field: 'equipManufr' },
  { title: 'MODEL', field: 'equipModel' },
  { title: 'PO', field: 'poId', sortable: true },
  { title: 'PAID AMOUNT', field: 'invoicePaidAmt' },
  { title: 'DUE AMOUNT', field: 'invoiceDueAmt' }
];
export const DASHBOARD_EQUIPMENT_LIST_COLUMNS: ColumnDefs[] = [
  { title: 'SERIAL #', field: 'equipSerialNo', sortable: true, sortKey: 'med.EQUIPMENT_SRNO' },
  { title: 'UNIT #', field: 'unitNo', sortable: true, sortKey: 'med.EQUIPMENT_NAME' },
  { title: 'MODEL', field: 'equipModel', sortable: true, sortKey: 'med.EQUIPMENT_MODEL' },
  { title: 'MAKE', field: 'equipMake', sortable: true, sortKey: 'med.EQUIPMENT_MAKE' },
  { title: 'YEAR', field: 'equipYear', sortable: true, sortKey: 'med.EQU_YEAR * 1' },
  { title: 'LOCATION', field: 'location', sortable: false },
  { title: 'LAST METER', field: 'equipCMHR', sortable: true, sortKey: 'med.CURRENT_HOUR_METER  * 1' },
];


export const INVOICE_EXP_COLUMNS: ColumnDefs[] = [
  // { title: 'WO', field: 'workOrderId', sortable: true },
  { title: 'MAKE', field: 'equipManufr', sortable: true },
  { title: 'MODEL', field: 'equipModel', sortable: true },
  { title: 'PO', field: 'poId', sortable: true },
  { title: 'PAID', field: 'invoicePaidAmt', sortable: true },
  { title: 'DUE', field: 'invoiceDueAmt', sortable: true }
];

export const INVOICE_LIST_COLUMNS: ColumnDefs[] = [
  { title: 'INVOICE #', field: 'invoiceNumber', sortable: true, sortKey: 'OrdDocID' },
  { title: 'UNIT #', field: 'unitNumber', sortable: true, sortKey: 'EquID' },
  { title: 'SERIAL #', field: 'equipSerialNo', sortable: true, sortKey: 'EquSerial' },
  { title: 'WO #', field: 'workOrderId', sortable: false },
  { title: 'DATE', field: 'invoiceDate', sortable: true, type: 'date', sortKey: 'InvDt' },
  { title: 'LOCATION', field: 'equipLocation' },
  { title: 'DPR', field: 'departmentName', sortable: true, sortKey: 'DprID' },
  { title: 'AMOUNT', field: 'invoiceTotAmt', sortable: true, sortKey: 'InvAmtTot * 1' },
  { title: 'STATUS', field: 'invoicePaidStatus', sortable: true, sortKey: 'InvPaid' }
];

export const PM_LIST_COLUMNS: ColumnDefs[] = [
  { title: 'SERIAL #', field: 'equipmentSerialNo', sortable: true, sortKey: 'EquSerial' },
  { title: 'UNIT #', field: 'equipmentUnitNo', sortable: true, sortKey: 'EquUnit' },
  { title: 'LAST PM', field: 'lastPM', sortable: true, sortKey: 'LastPMDocSeg' },
  { title: 'MFR', field: 'equipmentMfr', sortable: true, sortKey: 'EquMake' },
  { title: 'MODEL', field: 'equipmentModel', sortable: true, sortKey: 'EquModel' },
  { title: 'DUE DATE', field: 'dueDate', sortable: true, type: 'date', sortKey: 'DtPMDue' },
  { title: 'ADDRESS', field: 'equipmentlocation', sortable: false },
];

export const PM_LIST_EXP_COLUMNS = [
  { title: 'SHIP TO', field: 'equipmentShipto' },
  { title: 'LAST PM DATE', field: 'lastPmDate' },
  { title: 'PM HOUR METER', field: 'pmHourMeter' }
];

export const CUSTOMER_LIST_COLUMNS: ColumnDefs[] = [
  { title: '', field: 'letter', sortable: false },
  { title: 'NAME', field: 'listUserFullName', sortable: true, sortKey: 'user_fname' },
  { title: 'EMAIL', field: 'listUserEmail', sortable: true, sortKey: 'email_id' },
  { title: 'BILLTO#', field: 'billId', sortable: true,sortKey: 'billId'},
  { title: 'COMPANY NAME', field: 'billToName', sortable: true,sortKey: 'billToName'},
  { title: 'LAST LOGIN', field: 'lastLogin', sortable: false},
  { title: 'SERVICE REQUEST', field: 'lastRequest', sortable: false },
  { title: 'SERVICE REPORT', field: 'lastReportSearch', sortable: false },
  { title: 'CONTACT NUMBER', field: 'listUserContactNumber', sortable: false },
  { title: '', field: 'edit', sortable: false },
  { title: '', field: 'activate', sortable: false },
  { title: 'STATUS', field: 'listUserStatus', sortable: true, sortKey: 'status' }
];

export const ADMIN_LIST_COLUMNS = [
  { title: 'NAME', field: 'listUserFullName', sortable: true },
  { title: 'JOB DESIGNATION', field: 'listUserJobDesign', sortable: true },
  { title: 'EMAIL', field: 'listUserEmail', sortable: true },
  { title: 'CONTACT NUMBER', field: 'listUserContactNumber', sortable: false },
  { title: '', field: 'edit', sortable: false },
  { title: 'STATUS', field: 'activate', sortable: false }
];


export const PM_REQUEST_EQUIPLIST = [
  { title: 'SERIAL #', field: 'equipSrNo', sortable: false },
  { title: 'UNIT #', field: 'equipUnitNo', sortable: false },
  { title: 'MAKE', field: 'equipMake', sortable: false },
  { title: 'MODEL', field: 'equipModel', sortable: false },
  { title: 'LOCATION', field: 'equipLocation', sortable: false },
  { title: '', field: 'remove', sortable: false }
];

export const ATTACHMENT_LIST = [
  { title: 'Attachment Name', field: 'fileName', sortable: false },
  { title: '', field: 'remove', sortable: false }
];

export const EQUIP_DETAILS_OPENJOBS_COLUMNS = [
  { title: 'WO #', field: 'workOrderId', sortable: true },
  { title: 'SERIAL #', field: 'equipSerialNo', sortable: true },
  { title: 'UNIT #', field: 'unitNo', sortable: true },
  { title: 'CREATED DATE', field: 'createdDate', sortable: true, type: 'date' },
  { title: 'WO DESCRIPTION', field: 'workOrderDesc', sortable: false },
  { title: 'WO TYPE', field: 'workOrderType', sortable: true },
  { title: 'WO STATUS', field: 'workOrderStatus', sortable: true },
  { title: 'LAST STATUS CHANGE', field: 'updatedOn', sortable: true, type: 'date' },
];

export const EQUIP_DETAILS_SERVICEHISTORY_COLUMNS = [
  { title: 'WO #', field: 'workOrderId', sortable: true },
  { title: 'WO DATE', field: 'workOrderDate', sortable: true, type: 'date' },
  { title: 'TECHNICIAN', field: 'technicianName', sortable: true },
  { title: 'PROBLEM', field: 'custProblem', sortable: false },
  { title: 'DIAGNOSIS', field: 'technicalDiagnosis', sortable: false },
  { title: 'WORK DONE', field: 'workDone', sortable: true },
  { title: 'PARTS', field: 'parts', sortable: true },
  // { title: 'WO STATUS', field: 'status', sortable: true },
  { title: '', field: 'more', sortable: false }
];
export const MHE_COST_COLUMNS: ColumnDefs[] = [
  { title: 'PERIOD', field: 'period', sortable: false },
  { title: 'TOTAL TRUCK SPEND', field: 'totalTruckSpend', sortable: false },
  { title: 'TOTAL RENTAL SPEND', field: 'totalRentalSpend', sortable: false },

];
export const FLEET_COMPOSITION_COLUMNS: ColumnDefs[] = [
  { title: 'PERIOD', field: 'period', sortable: false },
  { title: '# ACTIVATE UNITS SERVICED', field: 'activeUnitsServiced', sortable: false },
  { title: 'AVERAGE COST PER UNIT', field: 'averageCostPerUnit', sortable: false },

];
export const AVOIDABLE_SPEND_COLUMNS: ColumnDefs[] = [
  { title: 'PERIOD', field: 'period', sortable: false },
  { title: 'TOTAL OPERATOR ERROR', field: 'totalOperatorError', sortable: false },
  { title: '% OF TOTAL SPEND', field: 'percentTotalSpend', sortable: false },

];


export const TOPASSET_TOTALS_COLUMNS: ColumnDefs[] = [
  { title: 'FROM DATE', field: 'fromDate', sortable: true },
  { title: 'TO DATE', field: 'toDate', sortable: true },
 ]

 export const TOPASSET_LIST_COLUMNS: ColumnDefs[]=[
   {title:'SERIAL NUMBER' , field:'serialNo' ,sortable:false},
   {title:'UNIT' , field:'assetNo' ,sortable:false},
   {title:'MAKE' , field:'equipMake' ,sortable:false},
   {title:'MODEL' , field:'equipModel' ,sortable:false},
   //{title:'MODEL TYPE' , field:'assetNo' ,sortable:false},
   {title:'MODEL YEAR' , field:'equipYear' ,sortable:false},
   {title:'TOTAL SPEND' , field:'totalSpend' ,sortable:false},
   {title:'LOCATION SPEND' , field:'locationSpend' ,sortable:false},
   {title:'% OF LOCATION SPEND' , field:'locationPercentage' ,sortable:false}

   ]

   export const    TOPASSET_LIST_EXP_COLUMNS: ColumnDefs[]=[
    // {title:'SERIAL NUMBER' , field:'serialNo' ,sortable:true},
    {title:'LOCATION' , field:'location' ,sortable:false},
    {title:'HOURS' , field:'hr' ,sortable:false},
    // {title:'MAKE' , field:'equipMake' ,sortable:true},
    // {title:'MODEL' , field:'equipModel' ,sortable:true},
    // {title:'MODEL TYPE' , field:'assetNo' ,sortable:true},
    // {title:'MODEL YEAR' , field:'equipYear' ,sortable:true},
    // {title:'TOTAL SPEND' , field:'totalSpend' ,sortable:true},
    // {title:'LOCATION SPEND' , field:'locationSpend' ,sortable:true},
    // {title:'% OF LOCATION SPEND' , field:'locationPercentage' ,sortable:true},
    // {title:'LOCATION' , field:'location' ,sortable:true},


    ]
    export const   FLEET_ASSET_SUMMARY_COLUMNS: ColumnDefs[]=[
      {title:'Asset' , field:'assetNo' ,sortable:false},
      {title:'Serial' , field:'serialNo' ,sortable:false},
      {title:'Make' , field:'equipMake' ,sortable:false},
      {title:'Model' , field:'equipModel' ,sortable:false},
      {title:'Year' , field:'equipYear' ,sortable:false},
      {title:'First Order Date' , field:'firstOrderDate' ,sortable:false},
      {title:'Last Ord Date' , field:'lastOrderDate' ,sortable:false},
      {title:'First Meter' , field:'firstMeter' ,sortable:false},
      {title:'Last Meter' , field:'lastMeter' ,sortable:false},
      {title:'AmtTotal' , field:'amountTotal' ,sortable:false},
      /*{title:'AmtOther' , field:'amountOther' ,sortable:false},
      {title:'AmtTax' , field:'amountTax' ,sortable:false},
      {title:'Amount Parts' , field:'amountParts' ,sortable:false},
      {title:'Amount Labour' , field:'amountLabor' ,sortable:false},
      {title:'VarDays' , field:'varDays' ,sortable:false},
      {title:'VarHrs' , field:'varHrs' ,sortable:false},
      {title:'Cost/Hr' , field:'costPerHr' ,sortable:false},
      {title:'AnnHr' , field:'annHr' ,sortable:false},
      {title:'AGE' , field:'equipAge' ,sortable:false},*/
    ]
    export const   FLEET_ASSET_SUMMARY_EXP_COLUMNS: ColumnDefs[]=[
      // {title:'Asset' , field:'assetNo' ,sortable:false},
      // {title:'Serial' , field:'serialNo' ,sortable:false},
      // {title:'Make' , field:'equipMake' ,sortable:false},
      // {title:'Model' , field:'equipModel' ,sortable:false},
      // {title:'Year' , field:'equipYear' ,sortable:false},
      // {title:'First Ord Date' , field:'firstOrderDate' ,sortable:false},
      // {title:'Last Ord Date' , field:'lastOrderDate' ,sortable:false},
      // {title:'First Meter' , field:'firstMeter' ,sortable:false},
      // {title:'Last Meter' , field:'lastMeter' ,sortable:false},
      {title:'Amount Parts' , field:'amountParts' ,sortable:false},
      {title:'Amount Labour' , field:'amountLabor' ,sortable:false},
      {title:'Amount Other' , field:'amountOther' ,sortable:false},
      {title:'Amount Tax' , field:'amountTax' ,sortable:false},
      //{title:'Amount Total' , field:'amountTotal' ,sortable:false},
      {title:'Regular Repair',field:'',sortable:false},
      {title:'PM',field:'',sortable:false},
      {title:'Wheels/Tires',field:'',sortable:false},
      {title:'Batt/Charge',field:'',sortable:false},
      {title:'Major Repair',field:'',sortable:false},
      {title:'Damage Missuse',field:'',sortable:false},
      {title:'VarDays' , field:'varDays' ,sortable:false},
      {title:'VarHrs' , field:'varHrs' ,sortable:false},
      {title:'Cost/Hr' , field:'costperHour' ,sortable:false},
      {title:'AnnHr' , field:'annHr' ,sortable:false},
      {title:'AGE' , field:'equipAge' ,sortable:false},
    ]

    export const   CLAIMTYPE_WO_LIST_COLUMNS: ColumnDefs[]=[
      {title:'BILLTo #' , field:'billTo' ,sortable:false},
      {title:'SHIPTO #' , field:'shipTo' ,sortable:false},
      {title:'SERIAL #' , field:'equipSerialNo' ,sortable:false},
      {title:'UNIT #' , field:'unitNo' ,sortable:false},
      {title:'Year' , field:'equipYear' ,sortable:false},
      {title:'Make' , field:'equipMake' ,sortable:false},
      {title:'Model' , field:'equipModel' ,sortable:false},
      {title:'WO #' , field:'workOrderId' ,sortable:true},
      {title:'WO DATE' , field:'workOrderDate' ,sortable:true},
      {title:'TECHNICIAN' , field:'technicianName' ,sortable:true},
      // {title:'PROBLEM' , field:'custProblem' ,sortable:true},
      // {title:'DIAGNOSIS' , field:'technicalDiagnosis' ,sortable:true},
      // {title:'WORK DONE' , field:'workDone' ,sortable:true},
      // {title:'PARTS' , field:'' ,sortable:true},
      {title:'MORE' , field:'more' ,sortable:true},
      {title:'CLAIM TYPE' , field:'claimCode' ,sortable:false},
    ]
