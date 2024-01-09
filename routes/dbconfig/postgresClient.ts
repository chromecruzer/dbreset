import * as pool from "pg";
import PostgresConfigFactory from "./postgresConfigFactory";

export default class PostgresClient {
  private pool: pool.Pool;
  constructor(public config: PostgresConfigFactory) {
    this.pool = new pool.Pool(this.config.getSamConfig());
  }

  public getClient() {
    return this.pool.connect();
  }

  public release(client) {
    console.log('disconnecting client');
    client.release(true);

  }
  public disconnect() {
    return this.pool.end();
  }

  public async throwError(stage, err, client) {
    this.release(client);
    return Promise.reject(Error(`${stage} produced an error ${err}`));
  }
}
