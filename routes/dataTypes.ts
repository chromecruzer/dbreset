import { EmployeeRecord, EmployeeSignature } from "./records&Mappings.ts/employeeRecord";


export const dataTableNames = {
    employees: 'employees'
}

export const prefix = 'api'; //used by nginx to proxy to the trac-api server

export const myDateFormat = 'LL/dd/yyyy';
export type InputDataTypeLabel = ('string' | 'number' | 'date' | 'boolean');
export type InputDataType = (string | number | Date | boolean);
export type NullableString = (string | null);
export type NullableDate = (Date | null);
export type StringMap = { [id: string]: string };
export type BooleanMap = { [id: string]: boolean };
export type RecordSignature = (EmployeeSignature);
// for upload headers
export type UploadRecord = (EmployeeRecord);
//


export interface MatchedField {
    field: string;
    uuid: string;
    type: string;
    signature: RecordSignature;
}
export interface InputToSqlMapping {
    xlsxAddress?: string;
    dataType: InputDataTypeLabel;
    sqlLabel: string;
    sqlType: string;
    nullify?: (string) => (InputDataType | null); // function to replace certain strings with null
    default?: (InputDataType | null); // default for fields that are not in the spreadsheet
}