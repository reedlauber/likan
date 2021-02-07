import async from 'async';
import { QueryResult } from 'pg';

import Action from './actions/action';
import * as actions from './actions';
import { tableAlias } from './alias';
import Client from './client';
import * as processor from './processor';
import { DbResult, ModelOptions, SqlData, SqlParams } from './types';

class Model {
  readonly alias: string;
  client: Client;
  table: string;
  options: ModelOptions;
  resultsMiddleware = [];

  constructor(connectionString: string, table: string, options: ModelOptions) {
    this.table = table;
    this.options = options;
    this.client = new Client(connectionString, !!options.ssl);
    this.alias = tableAlias(table, options.alias);

    if (typeof options.dates === 'undefined') {
      this.options.dates = { createdAt: true, updatedAt: true };
    }

    if (options.publicFields) {
      this.result((result, processOptions) => processor.publicOnly(result, options.publicFields, processOptions));
    }
  }

  executeQuery(
    sql: string,
    params: SqlParams,
    onSuccess?: (rows: any[]) => void,
    onError?: (error: Error) => void
  ) {
    this.client.query(sql, params, (result: QueryResult) => {
      if (typeof onSuccess === 'function') {
        onSuccess(result.rows);
      }
    }, onError);
  }

  delete(where: number | string, params: SqlParams) {
    return actions.delete(this.executeQuery, this, where, params);
  }

  import(filePath: string, columns: string[]) {
    return actions.import(this.executeQuery, this, filePath, columns);
  }

  insert(data: SqlData) {
    return actions.insert(this.executeQuery, this, data, this.options.dates);
  }

  result(callback: (result: DbResult, processOptions?: Record<string, any>) => void) {
    this.resultsMiddleware.push(callback);
  }

  select(columns: string, options: Record<string, any>) {
    return actions.select(this.executeQuery, this, columns, options);
  }

  truncate() {
    return actions.truncate(this.executeQuery, this);
  }

  update(data: SqlData) {
    return actions.update(this.executeQuery, this, data);
  }
}

export default Model
