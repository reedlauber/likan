import { QueryResult } from 'pg';

import Model from '../model';
import { onQuerySuccess, QueryExecutor, SqlParams } from '../types';

type ErrorCallback = (error: Error) => Action;

export default class Action {
  errorCallback: ErrorCallback;
  executor: QueryExecutor;
  model: Model;

  constructor(model: Model, executor: QueryExecutor) {
    this.model = model;
    this.executor = executor;
  }
  
  error(callback: ErrorCallback): Action {
    this.errorCallback = callback;
    return this;
  }

  commitAction(sql: string, params: SqlParams, onSuccess?: onQuerySuccess) {
    this.executor.call(this.model, sql, params, onSuccess, this.errorCallback);
  }
}
