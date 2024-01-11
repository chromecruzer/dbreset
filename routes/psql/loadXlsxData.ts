import  fs from "fs-extra";
import * as xlsx from "xlsx";
import * as util from 'util'
import _ from "lodash";
import { InputToSqlMapping } from "../dataTypes";
import NotificationsServer from "./notificationsServer";
const dump = (obj: any, depth = null) => util.inspect(obj, { depth, colors: true });

const checkLength = (datum: string, mapping: InputToSqlMapping, cell: any) => {
  const regex = /char\((\d+)\)/;
  const sqlLength = parseInt(regex.test(mapping.sqlType) ? regex.exec(mapping.sqlType)[1] : '0');

  if (sqlLength !== 0 && !_.isString(datum)) {
    console.error(`datum '${datum}' does not have a value ${dump(cell)} for mapping ${dump(mapping)}`);
  } else if (sqlLength < datum.length) {
    console.error(`datum '${datum}' length ${datum.length} won't fit in sql ${dump(mapping)}`);
  }
};

export default class LoadXlsxData {
  fs = fs;
  xlsx = xlsx;
  public bulkData: (string | number | Date)[][];
  public lotNumbers: string[];
  headers: string[];

  constructor(protected ns: NotificationsServer | null = null) {
    this.bulkData = [];
    this.headers = [];
  }

  async scanForLotNumbers(xlsxPath: string) {
    console.log(`called with ${xlsxPath}`);
    this.bulkData = [];
    const newLotNumbers = [];
    const sheet = await this.readFirstSheet(xlsxPath);
    let emptyRowCounter = 0;
    let row = 1;

    while (emptyRowCounter < 8) {
      const lotNumber = this.findLotNumber(row, sheet);
      if (_.isString(lotNumber)) {
        newLotNumbers.push(lotNumber);
        emptyRowCounter = 0;
      } else {
        emptyRowCounter += 1;
      }
      row++;
    }
    console.log(`scanForLotNumbers found original ${newLotNumbers.length} records versus ${_.uniq(newLotNumbers).length} unique records`);
    this.lotNumbers = newLotNumbers;
  }

  private findLotNumber(row: number, sheet: any): string | null {
    const cellAddress = `A${row}`;
    const cell = sheet[cellAddress];
    if (cell && cell.t === 's' && !_.isEmpty(cell.w)) {
      return cell.w;
    }
    return null;
  }

  async readWithMap(xlsxPath: string, mapping: InputToSqlMapping[]) {
    const firstSheet = await this.readFirstSheet(xlsxPath);
    let emptyRow = false;
    this.loadHeaders(firstSheet);
    let row = 2; // row 1 is the headers

    console.log(`reading with mapping ${dump(mapping)} from ${xlsxPath}`);
    while (!emptyRow) {
      const dataRow: (Date | string | number)[] = [];
      emptyRow = true;
      mapping.forEach(c => {
        const cellAddress = `${c.xlsxAddress}${row}`;
        let datum: Date | string | number = null;

        if (firstSheet[cellAddress] !== undefined) {
          const cellValue = firstSheet[cellAddress].w || firstSheet[cellAddress].v;
          emptyRow = false;

          switch (c.dataType) {
            case 'date':
              datum = new Date(cellValue);
              break;
            case 'number':
              datum = parseInt(cellValue);
              break;
              case 'string':
                datum = String(cellValue);
                checkLength(datum, c, firstSheet[cellAddress]);
                break;
            
            default:
              datum = cellValue;
          }
        }
        dataRow.push(datum);
      });

      if (!emptyRow) {
        this.bulkData.push(dataRow);
        row++;
      }
    }
  }

  private loadHeaders(firstSheet: any) {
    let col = 0;
    let header: string | null = null;
    do {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
      if (firstSheet[cellAddress]?.t === 's') {
        header = firstSheet[cellAddress].w;
        this.headers.push(header);
      }
      col += 1;
    } while (header);
  }

  private async readFirstSheet(xlsxPath: string) {
    if (this.ns) {
      this.ns.notify('INFO', `reading IOL Report`,
        `reading from ${xlsxPath}`, ['iolUpload']);
    }
    console.info(`reading from ${xlsxPath}`);
    
    try {
      const buffer = await this.fs.readFile(xlsxPath);
      const sheets = this.xlsx.read(buffer, { type: 'buffer' });
      return sheets.Sheets[sheets.SheetNames[0]];
    } catch (error) {
      console.error(`Error reading file: ${error}`);
      throw error;
    }
  }
}
