import { PathLike } from 'fs';
import fs from 'fs/promises'; // Import the 'fs' module
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

    public static async load(filepath: PathLike | fs.FileHandle, nodeFs = fs) {
        try {
            const data = await nodeFs.readFile(filepath, 'utf-8'); // Read the file content
            const config = JSON.parse(data); // Parse the JSON content
            return new PostgresConfigFactory(config);
        } catch (error) {
            console.error('Error reading JSON file:', error);
            throw error; // Propagate the error
        }
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
