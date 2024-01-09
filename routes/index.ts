export default eventHandler(() => {
  return { nitro: `From unique force !! ${test} & ${value}` }
})

import chalk from "chalk"
import { ali } from "./dbconfig/recreateDb"

const test:any =  ali(1,2)
const value:string = "this is value "

console.log(chalk.bgMagenta(value,`from dollar ${test}`))

// code for db-reset 

import path from 'path';
import yargs from "yargs";

import sourceMap from 'source-map-support';
sourceMap.install();

import PostgresClient from "./dbconfig/postgresClient"
import PostgresConfigFactory from "./dbconfig/postgresConfigFactory" 
import { dataTableNames } from "./dataTypes"