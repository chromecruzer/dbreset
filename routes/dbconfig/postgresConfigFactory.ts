import * as fs from "fs-extra";
export interface PostgresConfig {
    user: string;
    password: string;
    port: number;
    host: string;
    rootdatabase: string;
    database: string;
    schema: string;
}

export default  class PostgresConfigFactory {
    constructor(public config: PostgresConfig) {
    }

    public static async load(filepath, nodeFs = fs) {
        // console.log(`opening dbConfig at ${filepath}`);
        const config = await nodeFs.readJSON(filepath);
        return new PostgresConfigFactory(config);
    }

    public getSamConfig() {
        const { user, password, port, host, database } = this.config;
        return {
            user,
            password,
            port,
            host,
            database
        }
    }

    public getRootConfig() {
        const { user, password, port, host, rootdatabase } = this.config;
        return {
            user,
            password,
            port,
            host,
            database: rootdatabase
        }
    }

    public getSchemaName() {
        return this.config.schema;
    }


    public getDbName() {
        return this.config.database;
    }
}
