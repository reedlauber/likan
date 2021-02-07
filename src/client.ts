import { Pool, QueryResult } from 'pg';

type onSuccessCallback = (result: QueryResult) => void;
type onErrorCallback = (error: Error, query: string) => void;

class LikanClient {
  pool: Pool;

  constructor(connectionString: string, ssl: boolean = false) {
    this.pool = new Pool({ connectionString, ssl });
  }

  onError(error: Error, query: string) {
    console.error(`Error running query "${query}"\n${error}`);
  }

  query(query: string, params: any[], onSuccess: onSuccessCallback, onError: onErrorCallback = this.onError) {
    this.pool.connect((error, client, release) => {
      if (error) {
        return console.error('Could not connect to postgres', error);
      }

      client.query(query, params, (error, result) => {
        release();

        if (error) {
          return onError(error, query);
        }

        onSuccess(result);
      });
    });
  }
}

export default LikanClient;
