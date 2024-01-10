import { transformHelpers, recordFromArray } from "../psql/postgresql";
import BulkSqlWithCreate from "../psql/bulkSqkwithCreate";
import LoadXlsxData from "../psql/loadXlsxData";
import PostgresClient from "./postgresClient";
import { InputToSqlMapping } from "../dataTypes";
import _ from "lodash";

export default class ImportData {
  private mapping: InputToSqlMapping[];

  constructor(
    private title: string,
    private schemaName: string,
    private postgresClient: PostgresClient,
    private tableName: string
  ) {
    const tableMappings = transformHelpers[this.tableName];
    if (tableMappings && tableMappings.mappings) {
      this.mapping = tableMappings.mappings;
      console.log('Mappings:', this.mapping);
    } else {
      console.error(`Mappings for table ${this.tableName} not found or invalid.`);
    
      this.mapping = []; // Assigning an empty array or appropriate default value
    }
  }

  async import(filepath: string, chunkSize = 5000, createSchema = false, addToSearch = true) {
    console.log(`Importing ${this.title}`);
    const loadXlxs = new LoadXlsxData();
    await loadXlxs.readWithMap(filepath, this.mapping);
    console.log('Loaded xlsx data');

    const fillData = new BulkSqlWithCreate(this.schemaName, this.tableName, this.mapping);
    const client = await this.postgresClient.getClient();

    if (createSchema) {
      await fillData.createSchema(client)
        .catch(err => this.postgresClient.throwError('Create Schema', err, client));
      console.log('Created schema');
    }

    await fillData.createTable(client)
      .catch(err => this.postgresClient.throwError(`Create ${this.title} Table`, err, client));
    console.log(`Created ${this.title} Table`);

    const transformed = this.convertSpreadsheetRecords(loadXlxs.bulkData as []);
    await fillData.fill(transformed, client, chunkSize)
      .catch(err => this.postgresClient.throwError(`Fill ${this.title} Data`, err, client));

    this.postgresClient.release(client);
  }

  private convertSpreadsheetRecords(uploadedData: []) {
    console.info(`Convert spreadsheet data`);
    return _.map(uploadedData, u => recordFromArray(u, this.mapping));
  }
}
