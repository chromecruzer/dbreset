import { SignatureFields } from "./searchSignature";
import _ from 'lodash'

export const condensedProductTableColumns = [
    {
      header: 'Employee ID',
      accessor: 'employee_id',
    },
    {
      header: 'Employee Name',
      accessor: 'employee_name',
    },
    {
      header: 'Gender',
      accessor: 'gender',
    },
]

export const productTableColumns = [
    {
      header: 'Employee ID',
      accessor: 'employee_id',
    },
    {
      header: 'Employee Name',
      accessor: 'employee_name',
    },
    {
      header: 'Gender',
      accessor: 'gender',
    },

]

export interface EmployeeSignature {
    employee_id: string;
    employee_name: string;
  }

  export interface EmployeeRecord {
    uuid: string;
    employee_id: string;
    employee_name: string;
    gender: string;
  }


  export const employeeTextSearchFields: SignatureFields = {
    searchFields: [
      'employee_id',
      'employee_name',
      'gender'
    ],
    type: 'employee',
    idFieldFn: () => 'employee_id'
  };
  export const matchEmployeeFields = (a,b) => {
    return a.employee_id === b.employee_id
  }