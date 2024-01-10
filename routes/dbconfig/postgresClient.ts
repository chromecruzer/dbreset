import pkg from 'pg'; // Import the entire 'pg' module using default import
const { Pool } = pkg; // Extract the Client class from the imported 'pg' module
import PostgresConfigFactory from "./postgresConfigFactory";
export default class PostgresClient {
  private pool: Pool;

  constructor(public config: PostgresConfigFactory) {
    this.pool = new Pool(this.config.getSamConfig());
  }

  public async getClient() {
    return this.pool.connect();
  }

  public async release(client: any) {
    try {
      console.log('Disconnecting client');
      client.release(true);
    } catch (error) {
      console.error('Error releasing client:', error);
      throw error;
    }
  }

  public async disconnect() {
    try {
      await this.pool.end();
      console.log('Disconnected from the pool');
    } catch (error) {
      console.error('Error disconnecting from the pool:', error);
      throw error;
    }
  }

  public async throwError(stage: string, err: Error, client: any) {
    try {
      await this.release(client);
      throw new Error(`${stage} produced an error ${err}`);
    } catch (error) {
      console.error('Error handling throw error:', error);
      throw error;
    }
  }
}