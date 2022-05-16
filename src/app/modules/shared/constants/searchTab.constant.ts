import { WOSTATUS_DATA } from './drodown.constants';

export class EquipmentListSeatch {
  tab = [
    { col: 3, inputType: 'Text', placeHolder: 'Serial #', field: 'equipSerialNo' },
    { col: 2, inputType: 'Text', placeHolder: 'Model', field: 'equipModel' },
    { col: 2, inputType: 'Text', placeHolder: 'Make', field: 'equipMake' },
    { col: 2, inputType: 'Number', placeHolder: 'Year', field: 'equipYear' },
    {
      col: 3, inputType: 'Dropdown', placeHolder: 'Select Location', field: 'location', metadata: {
        data: [],
        multi: true,
        placeholder: 'Select Location'
      }
    },
    // { col: 2, inputType: 'Text', placeHolder: 'Test' }
  ];
}

export class InvoiceListSearchTab {
  tab = [
    { col: 2, inputType: 'Date', placeHolder: 'From Date', field: 'fromDate' },
    { col: 2, inputType: 'Date', placeHolder: 'To Date', field: 'toDate' },
    { col: 1, inputType: 'Text', placeHolder: 'Inv #', field: 'invoiceNo' },
    { col: 1, inputType: 'Text', placeHolder: 'WO #', field: 'woID' },
    // { col: 2, inputType: 'Text', placeHolder: 'Invoice Status', field: 'invoiceStatus' },
    {
      col: 2, inputType: 'Dropdown', placeHolder: 'Select Status', field: 'invoiceStatus', metadata: {
        data: [{ key: '0', value: 'Unpaid' },
        { key: '1', value: 'Paid' }],
        multi: false,
        allowSearchFilter: false,
        placeholder: 'Select Status'
      }
    },
    {
      col: 2, inputType: 'Dropdown', placeHolder: 'Select Location', field: 'location', metadata: {
        data: [],
        multi: true,
        placeholder: 'Select Location'
      }
    },
    {
      col: 2, inputType: 'Dropdown', placeHolder: 'DPR', field: 'department', metadata: {
        data: [],
        multi: true,
        placeholder: 'DPR'
      }
    }
  ];
}

export class WorkOrderSearch {
  tab = [
    { col: 1, inputType: 'Text', placeHolder: 'WO #', field: 'woID' },
    { col: 1, inputType: 'Text', placeHolder: 'Serial #', field: 'equipSRNO' },
    { col: 2, inputType: 'Date', placeHolder: 'From Date', field: 'fromDate' },
    { col: 2, inputType: 'Date', placeHolder: 'To Date', field: 'toDate' },
    {
      col: 2, inputType: 'Dropdown', placeHolder: 'Select WO Status', field: 'woStatus', metadata: {
        data: Object.freeze([]),
        multi: true,
        placeholder: 'WO Status'
      }
    },
    {
      col: 2, inputType: 'Dropdown', placeHolder: 'Select WO Status', field: 'location', metadata: {
        data: Object.freeze([]),
        multi: true,
        placeholder: 'Location'
      }
    },
    {
      col: 2, inputType: 'Dropdown', placeHolder: 'Select WO Status', field: 'isPM', metadata: {
        data: WOSTATUS_DATA,
        allowSearchFilter: false,
        multi: false,
        placeholder: 'WO Type'
      },
      value: 2
    }
  ];
}

export class PmListSearch {
  tab = [
    { col: 3, inputType: 'Text', placeHolder: 'Serial #', field: 'equipSRNO' },
    { col: 2, inputType: 'Text', placeHolder: 'Unit #', field: 'equipUnitNo' },
    { col: 2, inputType: 'Text', placeHolder: 'MFR', field: 'equipMfr' },
    { col: 2, inputType: 'Text', placeHolder: 'Model', field: 'equipProdId' },
    {
      col: 3, inputType: 'Dropdown', placeHolder: 'Select Location', field: 'location', metadata: {
        data: [],
        multi: true,
        placeholder: 'Select Location'
      }
    },
    // { col: 2, inputType: 'Text', placeHolder: 'Test' }
  ];
}
export class CustomerSearch {
  tab = [
    { col: 3, inputType: 'Text', placeHolder: 'Customer Name', field: 'searchUserName' },
    { col: 3, inputType: 'Text', placeHolder: 'Email Id', field: 'searchUserEmail' },
    { col: 3, inputType: 'Text', placeHolder: 'Bill To # / Customer Name', field: 'searchBillTo' },
    {
      col: 3, inputType: 'Dropdown', placeHolder: 'Select User Status', field: 'searchUserStatus', metadata: {
        data: [{ key: 'A', value: 'Active' },
        { key: 'I', value: 'Inactive' }],
        multi: false,
        allowSearchFilter: false,
        placeholder: 'Select User Status'
      }
    }
  ];
}
export class AdminSearch {
  tab = [
    { col: 3, inputType: 'Text', placeHolder: 'Admin Name', field: 'searchUserName' },
    { col: 3, inputType: 'Text', placeHolder: 'Job Designation', field: 'searchUserJobDesign' },
    { col: 3, inputType: 'Text', placeHolder: 'Email Id', field: 'searchUserEmail' },
    // {
    //   col: 2, inputType: 'Dropdown', placeHolder: 'Select Status', field: 'searchUserStatus', metadata: {
    //     data: [{ key: 'A', value: 'Active' },
    //     { key: 'I', value: 'Inactive' }],
    //     multi: false,
    //     placeholder: 'Select Status'
    //   }
    // }
  ];
}

export class claimTypeSearch {
  tab = [
    { col: 4, inputType: 'Date', placeHolder: 'From Date', field: 'startDate' },
    { col: 4, inputType: 'Date', placeHolder: 'To Date', field: 'endDate' },

  ];
}


