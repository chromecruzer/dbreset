export default eventHandler(() => {
  return { nitro: `From unique force !! ${test} & ${value}` }
})

import chalk from "chalk"
import { ali } from "./dbconfig/recreateDb"

const test: any = ali(1, 2)
const value: string = "this is value "

console.log(chalk.bgMagenta(value, `from dollar ${test}`))

// code for db-reset 

import path from 'path';
import yargs from 'yargs';
import util from 'util';

import sourceMap from 'source-map-support';
sourceMap.install();

import PostgresConfigFactory from './dbconfig/postgresConfigFactory';
import PostgresClient from './dbconfig/postgresClient';
import RecreateDatabase from './dbconfig/recreateDataBase';
import ImportData from './dbconfig/importData';
import { dataTableNames } from './dataTypes';

const dump = (obj, depth = null) => util.inspect(obj, { depth, colors: true });

const argv = yargs(process.argv.slice(2))
  .options({
    configPath: {
      type: 'string',
      default: path.join(process.cwd(), 'config', 'dbConfig.json'),
      describe: 'path to the database configuration',
    },
    clearAudits: {
      type: 'boolean',
      default: false,
      describe: 'drop existing audits if true',
    },
  })
  .help('?')
  .alias('?', 'help')
  .argv;

const configPath = argv['configPath'];
const removeDb = argv['clearAudits'];
let config: PostgresConfigFactory, recreateDb: RecreateDatabase, postgresClient: PostgresClient, loadEmployeeData: ImportData;

const testConnection = async () => {
  await recreateDb.connect();
  try {
    await recreateDb.recreate();
  } catch (err) {
    throw new Error(`Recreate returned with an error: ${err}`);
  } finally {
    await recreateDb.disconnect();
  }
};

const initialize = async () => {
  config = await PostgresConfigFactory.load(configPath);
  recreateDb = new RecreateDatabase(config, removeDb);
  postgresClient = new PostgresClient(config);
  loadEmployeeData = new ImportData('Employee Data', config.getSchemaName(), postgresClient, dataTableNames.employees);
};

const run = async () => {
  try {
    await initialize();
    await testConnection();
    console.log(`${removeDb ? 'Database created' : 'Data schema dropped'}`);

    const client = await postgresClient.getClient();
    // Ensure schema exists or handle the scenario where it doesn't
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${config.getSchemaName()}`);
      console.log('Schema created or already exists');
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }

    const excelFilePath = path.resolve('./routes/EMP_DATA.xlsx');
    await loadEmployeeData.import(excelFilePath, 5000);

    console.log('Employee table created and filled');

    await postgresClient.disconnect();
    console.log('Script is done');
  } catch (err) {
    console.error('Script had an error:', err);
  }
};

run();