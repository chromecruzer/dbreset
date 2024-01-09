import { InputToSqlMapping  } from "../dataTypes";
export const employeeMappings: InputToSqlMapping[]=[
    {
        xlsxAddress: 'A',
        dataType: 'string',
        sqlLabel: 'employee_id',
        sqlType: 'varchar(30)',
      },
      {
        xlsxAddress: 'B',
        dataType: 'string',
        sqlLabel: 'employee_name',
        sqlType: 'varchar(50)',
      },
      {
        xlsxAddress: 'C',
        dataType: 'string',
        sqlLabel: 'gender',
        sqlType: 'varchar(30)',
      },
     
    ]